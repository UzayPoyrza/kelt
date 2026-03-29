import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";

// Voice mapping: frontend names → TTS voice IDs
const VOICE_MAP: Record<string, string> = {
  aria: "Graham",
  james: "Claire",
  lin: "Luna",
  aditya: "Silas",
};
const VALID_VOICES = new Set(["Graham", "Claire", "Luna", "Silas"]);

function toTtsVoiceId(frontendVoice: string): string {
  // Already a valid TTS voice ID (studio uses these directly)
  if (VALID_VOICES.has(frontendVoice)) return frontendVoice;
  return VOICE_MAP[frontendVoice] || "Graham";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refundOnTtsFailure(supabase: any, targetGenId: string | null) {
  if (!targetGenId) return;
  // Mark generation as failed
  await supabase.from("generations").update({ status: "failed" }).eq("id", targetGenId);
  // Check if this generation cost a credit
  const { data: gen } = await supabase
    .from("generations")
    .select("credit_cost, user_id")
    .eq("id", targetGenId)
    .single();
  if (gen && gen.credit_cost > 0) {
    await supabase.rpc("refund_credit", { user_id_input: gen.user_id });
    await supabase.from("credit_ledger").insert({
      user_id: gen.user_id,
      amount: 1,
      reason: "refund_tts_failed",
      generation_id: targetGenId,
    });
    console.log("[render] Credit refunded for failed TTS. Generation:", targetGenId);
  }
}

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const { session_id, generation_id } = await request.json();

  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  // Resolve the target generation (explicit or latest)
  let targetGenId = generation_id;
  if (!targetGenId) {
    const { data: latestGen } = await supabase
      .from("generations")
      .select("id")
      .eq("session_id", session_id)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    targetGenId = latestGen?.id;
  }

  // Fetch session with script, voice, and title
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id, voice, title, script")
    .eq("id", session_id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.user_id !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extract the final script text from any stored format
  const scriptData = session.script as unknown;
  let scriptText: string | null = null;

  if (typeof scriptData === "string") {
    scriptText = scriptData;
  } else if (Array.isArray(scriptData)) {
    // ScriptBlock[] from studio editor
    const voiceBlocks = (scriptData as Array<{ type: string; text?: string; pauseDuration?: number; duration?: number }>)
      .map((block) => {
        if (block.type === "voice" && block.text) return block.text;
        if (block.type === "pause" && (block.pauseDuration || block.duration)) return `[pause: ${block.pauseDuration || block.duration}]`;
        return null;
      })
      .filter(Boolean);
    scriptText = voiceBlocks.join("\n") || null;
  } else if (scriptData && typeof scriptData === "object") {
    const obj = scriptData as Record<string, unknown>;
    scriptText = (obj.final || obj.raw) as string | null;
  }

  if (!scriptText) {
    console.error("[render] No script found. scriptData type:", typeof scriptData, "value preview:", JSON.stringify(scriptData)?.slice(0, 200));
    return NextResponse.json({ error: "No script found on session" }, { status: 400 });
  }

  console.log("[render] Script type:", typeof scriptData, "| text length:", scriptText.length, "| first 100 chars:", scriptText.slice(0, 100));
  const voiceId = toTtsVoiceId(session.voice || "aria");

  // Use generation_id as the audio file identifier so each render is unique
  const audioFileId = targetGenId || session_id;
  const payload = {
    session_id: audioFileId,
    script: scriptText,
    voice_id: voiceId,
    title: session.title || "",
  };
  console.log("[render] Invoking mindflow-tts Lambda:", JSON.stringify({
    session_id, generation_id: targetGenId, audio_file_id: audioFileId, voice_id: voiceId, script_length: scriptText.length,
  }));

  try {
    // Direct Lambda invocation via AWS Lambda Invoke API (bypasses broken API Gateway)
    const { LambdaClient, InvokeCommand } = await import("@aws-sdk/client-lambda");
    const lambda = new LambdaClient({ region: "us-east-1" });
    const command = new InvokeCommand({
      FunctionName: "mindflow-tts",
      Payload: new TextEncoder().encode(JSON.stringify(payload)),
    });

    const response = await lambda.send(command);

    if (response.FunctionError) {
      const errorBody = new TextDecoder().decode(response.Payload);
      console.error("[render] Lambda error:", errorBody);
      await refundOnTtsFailure(supabase, targetGenId);
      return NextResponse.json({ error: "TTS Lambda failed", refunded: true }, { status: 502 });
    }

    const result = JSON.parse(new TextDecoder().decode(response.Payload));
    console.log("[render] TTS success:", JSON.stringify(result));

    // Persist audio_url to the specific generation
    if (result.audio_url && targetGenId) {
      await supabase
        .from("generations")
        .update({ audio_url: result.audio_url })
        .eq("id", targetGenId);
    }

    return NextResponse.json({
      audio_url: result.audio_url,
      status: result.status || "completed",
    });
  } catch (err) {
    console.error("[render] Lambda invocation failed:", err);
    await refundOnTtsFailure(supabase, targetGenId);
    return NextResponse.json({ error: "Render failed", refunded: true }, { status: 502 });
  }
}
