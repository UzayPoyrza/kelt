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

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const { session_id } = await request.json();

  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
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
    const voiceBlocks = (scriptData as Array<{ type: string; text?: string; duration?: number }>)
      .map((block) => {
        if (block.type === "voice" && block.text) return block.text;
        if (block.type === "pause" && block.duration) return `[pause: ${block.duration}]`;
        return null;
      })
      .filter(Boolean);
    scriptText = voiceBlocks.join("\n") || null;
  } else if (scriptData && typeof scriptData === "object") {
    const obj = scriptData as Record<string, unknown>;
    scriptText = (obj.final || obj.raw) as string | null;
  }

  if (!scriptText) {
    return NextResponse.json({ error: "No script found on session" }, { status: 400 });
  }

  const voiceId = toTtsVoiceId(session.voice || "aria");

  const payload = {
    session_id,
    script: scriptText,
    voice_id: voiceId,
    title: session.title || "",
  };
  console.log("[render] Invoking mindflow-tts Lambda:", JSON.stringify({
    session_id, voice_id: voiceId, script_length: scriptText.length, title: session.title,
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
      return NextResponse.json({ error: "TTS Lambda failed" }, { status: 502 });
    }

    const result = JSON.parse(new TextDecoder().decode(response.Payload));
    console.log("[render] TTS success:", JSON.stringify(result));

    // Persist audio_url to the latest generation for this session
    if (result.audio_url) {
      const { data: latestGen } = await supabase
        .from("generations")
        .select("id")
        .eq("session_id", session_id)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestGen) {
        await supabase
          .from("generations")
          .update({ audio_url: result.audio_url })
          .eq("id", latestGen.id);
      }
    }

    return NextResponse.json({
      audio_url: result.audio_url,
      status: result.status || "completed",
    });
  } catch (err) {
    console.error("[render] Lambda invocation failed:", err);
    return NextResponse.json({ error: "Render failed" }, { status: 502 });
  }
}
