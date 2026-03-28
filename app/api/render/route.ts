import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";

const MINDFLOW_API = "https://j6w7gkn6x7.execute-api.us-east-1.amazonaws.com/v1/sessions";

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

  // Resolve voice ID (handle legacy IDs)
  const voiceId = session.voice || "Graham";

  console.log("[render] Calling MindFlow render API:", JSON.stringify({ session_id, voice_id: voiceId, title: session.title }));

  try {
    const response = await fetch(`${MINDFLOW_API}/${session_id}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id,
        voice_id: voiceId,
        timestamps: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[render] MindFlow render error:", errorBody);
      return NextResponse.json({ error: "TTS render failed" }, { status: 502 });
    }

    const result = await response.json();
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
    console.error("[render] Render call failed:", err);
    return NextResponse.json({ error: "Render failed" }, { status: 502 });
  }
}
