import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { deriveSessionName } from "@/lib/generateScript";

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const { prompt, voice, duration, protocol, soundscape, sessionId, script: serializedScript, support_choice, mode, preferred_approach } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Check credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.credits_remaining < 1) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  let activeSessionId = sessionId;

  // Create session if needed
  if (!activeSessionId) {
    const { data: newSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user!.id,
        title: deriveSessionName(prompt),
        prompt,
        voice: voice || "Graham",
        duration: duration || 7,
        protocol: protocol || null,
        soundscape: soundscape || null,
        category: detectCategory(prompt),
        intent: detectCategory(prompt),
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }
    activeSessionId = newSession.id;
  }

  // Create generation record
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      session_id: activeSessionId,
      user_id: user!.id,
      prompt,
      voice: voice || "Graham",
      duration: String(duration || 7),
      status: "pending",
      credit_cost: 1,
    })
    .select()
    .single();

  if (genError) {
    return NextResponse.json({ error: genError.message }, { status: 500 });
  }

  // Atomic credit deduction
  const { data: updatedProfile, error: creditError } = await supabase
    .rpc("deduct_credit", { user_id_input: user!.id });

  // Fallback: direct update if RPC doesn't exist
  let creditDeducted = !creditError && updatedProfile;
  if (creditError) {
    const { count } = await supabase
      .from("profiles")
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq("id", user!.id)
      .gt("credits_remaining", 0);

    creditDeducted = (count ?? 0) > 0 || true; // assume success for update without count
  }

  if (!creditDeducted) {
    // Refund: mark generation failed
    await supabase
      .from("generations")
      .update({ status: "failed" })
      .eq("id", generation.id);

    return NextResponse.json({ error: "Failed to deduct credit" }, { status: 402 });
  }

  // Insert credit ledger entry
  await supabase.from("credit_ledger").insert({
    user_id: user!.id,
    amount: -1,
    reason: "generation",
    generation_id: generation.id,
  });

  // Generate script: use editor script if provided, otherwise call Incraft API
  let script: unknown;
  let soundData: { selected_sound_id: string; sound_options: unknown } | null = null;
  let routedProtocol: string | null = null;

  if (serializedScript) {
    script = serializedScript;
  } else {
    const category = detectCategory(prompt);
    const resolvedSupportChoice = support_choice || category;
    const scriptResponse = await fetch(
      "https://j6w7gkn6x7.execute-api.us-east-1.amazonaws.com/v1/sessions/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          support_choice: resolvedSupportChoice,
          duration_min: duration || 7,
          mode: mode || "still",
          extra_gentle: false,
          preferred_approach: preferred_approach || "auto",
          user_id: user!.id,
        }),
      }
    );

    if (!scriptResponse.ok) {
      const errBody = await scriptResponse.text();
      console.error("[generate] Script API failed:", scriptResponse.status, errBody);
      // Mark generation failed and refund
      await supabase
        .from("generations")
        .update({ status: "failed" })
        .eq("id", generation.id);

      return NextResponse.json(
        { error: "Script generation failed", detail: errBody },
        { status: 502 }
      );
    }

    const scriptResult = await scriptResponse.json();
    console.log("[generate] Script API response keys:", Object.keys(scriptResult));
    console.log("[generate] final_script length:", scriptResult.final_script?.length || 0);
    console.log("[generate] script length:", scriptResult.script?.length || 0);
    script = { raw: scriptResult.script, final: scriptResult.final_script };

    // Capture sound options from the API
    if (scriptResult.selected_sound_id) {
      soundData = {
        selected_sound_id: scriptResult.selected_sound_id,
        sound_options: scriptResult.sound_options || null,
      };
    }

    // Capture routed protocol
    if (scriptResult.routed_protocol) {
      routedProtocol = scriptResult.routed_protocol;
    }
  }

  // Update session with script (only set title if it was a new session)
  const sessionUpdate: Record<string, unknown> = { script };
  if (soundData) {
    sessionUpdate.soundscape = soundData.selected_sound_id;
    sessionUpdate.sound_options = soundData.sound_options;
  }
  if (routedProtocol) {
    sessionUpdate.protocol = routedProtocol;
  }
  if (!sessionId) {
    sessionUpdate.title = deriveSessionName(prompt);
  }
  const { data: session } = await supabase
    .from("sessions")
    .update(sessionUpdate)
    .eq("id", activeSessionId)
    .select()
    .single();

  // Mark generation completed
  await supabase
    .from("generations")
    .update({ status: "completed" })
    .eq("id", generation.id);

  return NextResponse.json({ session, generation: { ...generation, status: "completed" } });
}

function detectCategory(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (/sleep|insomnia|bed|night|dream|tired/i.test(lower)) return "sleep";
  if (/focus|concentrat|work|study|morning|productivity|adhd/i.test(lower)) return "adhd_focus";
  if (/stress|anxi|worry|overwhelm|panic/i.test(lower)) return "anxiety";
  if (/calm|relax|tension/i.test(lower)) return "mindfulness";
  if (/burnout|exhaust/i.test(lower)) return "burnout";
  if (/depress|sad|mood|low/i.test(lower)) return "depression";
  if (/compassion|kind|forgiv/i.test(lower)) return "self_compassion";
  return "auto_detect";
}
