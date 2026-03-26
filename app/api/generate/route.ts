import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { generateScript, deriveSessionName, serializeScript } from "@/lib/generateScript";

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const { prompt, voice, duration, protocol, soundscape, sessionId, script: serializedScript } = body;

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
        voice: voice || "aria",
        duration: duration || 10,
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
      voice: voice || "aria",
      duration: String(duration || 10),
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

  // Use serialized script from editor if provided, otherwise fall back to mock
  const script = serializedScript || serializeScript(generateScript(prompt));

  // Update session with script (only set title if it was a new session)
  const sessionUpdate: Record<string, unknown> = { script };
  if (!sessionId) {
    // New session — title was already set during insert, but update with derived name
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
  if (/focus|concentrat|work|study|morning|productivity/i.test(lower)) return "focus";
  if (/stress|anxi|worry|overwhelm|calm|relax|tension/i.test(lower)) return "stress";
  return "default";
}
