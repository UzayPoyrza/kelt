import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { deriveSessionName, parseRawScript } from "@/lib/generateScript";

export async function POST(request: NextRequest) {
  const { user, supabase, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const { prompt, voice, duration, protocol, soundscape, sessionId, script: serializedScript, support_choice, mode, preferred_approach } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  console.log("[generate] Starting:", { prompt: prompt.slice(0, 60), voice, duration, userId: user!.id.slice(0, 8) });

  // === Authorization: check credits ===
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.credits_remaining < 1) {
    console.log("[generate] Insufficient credits:", profile?.credits_remaining);
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }
  console.log("[generate] Credits OK:", profile.credits_remaining);

  let activeSessionId = sessionId;

  // Create session if needed
  if (!activeSessionId) {
    const { data: newSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user!.id,
        title: deriveSessionName(prompt),
        prompt,
        voice: voice || "Luna",
        duration: duration || 7,
        protocol: protocol || null,
        soundscape: soundscape || null,
        category: detectCategory(prompt),
        intent: detectCategory(prompt),
      })
      .select()
      .single();

    if (sessionError) {
      console.error("[generate] Session creation failed:", sessionError.message);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }
    activeSessionId = newSession.id;
    console.log("[generate] Session created:", activeSessionId);
  }

  // Create generation record
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      session_id: activeSessionId,
      user_id: user!.id,
      prompt,
      voice: voice || "Luna",
      duration: String(duration || 7),
      status: "pending",
      credit_cost: 1,
    })
    .select()
    .single();

  if (genError) {
    console.error("[generate] Generation record failed:", genError.message);
    return NextResponse.json({ error: genError.message }, { status: 500 });
  }
  console.log("[generate] Generation record created:", generation.id);

  // Credit deduction
  const { data: creditDeducted, error: creditError } = await supabase
    .rpc("deduct_credit", { user_id_input: user!.id });

  if (creditError || !creditDeducted) {
    await supabase
      .from("generations")
      .update({ status: "failed" })
      .eq("id", generation.id);

    return NextResponse.json({ error: "Failed to deduct credit" }, { status: 402 });
  }

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
  let apiTitle: string | null = null;
  let apiTimings: Record<string, number> | null = null;

  if (serializedScript) {
    script = serializedScript;
    console.log("[generate] Using editor script, length:", typeof serializedScript === "string" ? serializedScript.length : JSON.stringify(serializedScript).length);
    console.log("[generate] Editor script preview:", (typeof serializedScript === "string" ? serializedScript : JSON.stringify(serializedScript)).slice(0, 150));
  } else {
    // API only accepts duration_min: 3, 5, 7, 10, 12, 15 - clamp to nearest valid
    const validDurations = [3, 5, 7, 10, 12, 15];
    const apiDuration = validDurations.find(d => d >= (duration || 7)) || 7;

    // Let the API auto-detect when user didn't explicitly pick a support choice
    const resolvedSupportChoice = support_choice || "auto_detect";

    const apiBody = {
      prompt,
      support_choice: resolvedSupportChoice,
      duration_min: apiDuration,
      mode: mode || "still",
      extra_gentle: false,
      preferred_approach: preferred_approach || "auto",
    };
    console.log("[generate] Invoking mindflow-api Lambda:", JSON.stringify(apiBody));
    const scriptStartMs = Date.now();

    const { LambdaClient, InvokeCommand } = await import("@aws-sdk/client-lambda");
    const lambda = new LambdaClient({ region: "us-east-1" });

    // API Gateway v2 (HTTP API) event format required by Mangum
    const lambdaPayload = {
      version: "2.0",
      routeKey: "POST /v1/sessions/generate",
      rawPath: "/v1/sessions/generate",
      rawQueryString: "",
      requestContext: {
        http: { method: "POST", path: "/v1/sessions/generate", sourceIp: "127.0.0.1", protocol: "HTTP/1.1", userAgent: "lambda-direct" },
        accountId: "", apiId: "", domainName: "", domainPrefix: "",
        requestId: "direct-invoke", routeKey: "POST /v1/sessions/generate", stage: "v1", time: "", timeEpoch: 0,
      },
      headers: { "content-type": "application/json" },
      body: JSON.stringify(apiBody),
      isBase64Encoded: false,
    };

    const lambdaResponse = await lambda.send(new InvokeCommand({
      FunctionName: "mindflow-api",
      Payload: new TextEncoder().encode(JSON.stringify(lambdaPayload)),
    }));
    console.log("[generate] mindflow-api Lambda responded in", `${Date.now() - scriptStartMs}ms`);

    const lambdaResult = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

    // Handle Lambda-level errors
    if (lambdaResponse.FunctionError) {
      console.error("[generate] Lambda function error:", JSON.stringify(lambdaResult));
      await supabase
        .from("generations")
        .update({ status: "failed" })
        .eq("id", generation.id);
      if (!sessionId) {
        await supabase.from("generations").delete().eq("session_id", activeSessionId);
        await supabase.from("sessions").delete().eq("id", activeSessionId);
      }
      await supabase.rpc("refund_credit", { user_id_input: user!.id });
      await supabase.from("credit_ledger").insert({
        user_id: user!.id,
        amount: 1,
        reason: "refund_generation_failed",
        generation_id: generation.id,
      });
      return NextResponse.json(
        { error: "Script generation failed", detail: JSON.stringify(lambdaResult) },
        { status: 502 }
      );
    }

    // Parse API Gateway-style response (body may be a JSON string)
    let scriptResult;
    if (lambdaResult.statusCode && lambdaResult.body) {
      if (lambdaResult.statusCode >= 400) {
        console.error("[generate] Lambda returned error status:", lambdaResult.statusCode, lambdaResult.body);
        await supabase
          .from("generations")
          .update({ status: "failed" })
          .eq("id", generation.id);
        if (!sessionId) {
          await supabase.from("generations").delete().eq("session_id", activeSessionId);
          await supabase.from("sessions").delete().eq("id", activeSessionId);
        }
        await supabase.rpc("refund_credit", { user_id_input: user!.id });
        await supabase.from("credit_ledger").insert({
          user_id: user!.id,
          amount: 1,
          reason: "refund_generation_failed",
          generation_id: generation.id,
        });
        return NextResponse.json(
          { error: "Script generation failed", detail: lambdaResult.body },
          { status: 502 }
        );
      }
      scriptResult = typeof lambdaResult.body === "string" ? JSON.parse(lambdaResult.body) : lambdaResult.body;
    } else {
      // Direct response (not API Gateway format)
      scriptResult = lambdaResult;
    }
    // Log all API fields to discover title-like keys
    const stringFields = Object.entries(scriptResult)
      .filter(([, v]) => typeof v === "string" && (v as string).length < 200)
      .map(([k, v]) => `${k}=${v}`);
    console.log("[generate] API response keys:", Object.keys(scriptResult).join(", "));
    console.log("[generate] API string fields:", stringFields.join(" | "));

    // Verify the API returned a valid script
    if (scriptResult.status && scriptResult.status !== "script_ready") {
      console.error("[generate] Unexpected API status:", scriptResult.status);
    }
    if (!scriptResult.final_script && !scriptResult.script) {
      console.error("[generate] API returned no script content");
      await supabase.from("generations").update({ status: "failed" }).eq("id", generation.id);
      if (!sessionId) {
        await supabase.from("generations").delete().eq("session_id", activeSessionId);
        await supabase.from("sessions").delete().eq("id", activeSessionId);
      }
      await supabase.rpc("refund_credit", { user_id_input: user!.id });
      await supabase.from("credit_ledger").insert({
        user_id: user!.id, amount: 1, reason: "refund_no_script", generation_id: generation.id,
      });
      return NextResponse.json({ error: "Script generation returned empty content" }, { status: 502 });
    }

    script = { raw: scriptResult.script, final: scriptResult.final_script };

    // Extract title: check direct fields, then packet, then parse from script
    apiTitle = scriptResult.title
      || scriptResult.packet?.SCRIPT_INPUT_ROW?.title
      || scriptResult.session_title
      || scriptResult.session_name
      || scriptResult.generated_title
      || scriptResult.name
      || null;

    if (!apiTitle && scriptResult.final_script) {
      const parsed = parseRawScript(scriptResult.final_script);
      if (parsed.title) apiTitle = parsed.title;
    }
    if (!apiTitle && scriptResult.script) {
      const parsed = parseRawScript(scriptResult.script);
      if (parsed.title) apiTitle = parsed.title;
    }
    console.log("[generate] Resolved title:", apiTitle || "(using deriveSessionName)");

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
    if (scriptResult.timings) {
      apiTimings = scriptResult.timings;
    }
  }

  // Update session with script and title
  const sessionUpdate: Record<string, unknown> = { script };
  if (soundData) {
    sessionUpdate.soundscape = soundData.selected_sound_id;
    sessionUpdate.sound_options = soundData.sound_options;
  }
  if (routedProtocol) {
    sessionUpdate.protocol = routedProtocol;
  }
  // Always set title - from API or derived from prompt
  sessionUpdate.title = apiTitle || deriveSessionName(prompt);
  const { data: session } = await supabase
    .from("sessions")
    .update(sessionUpdate)
    .eq("id", activeSessionId)
    .select()
    .single();

  // Mark generation completed with timings
  await supabase
    .from("generations")
    .update({ status: "completed", timings: apiTimings })
    .eq("id", generation.id);

  return NextResponse.json({ session, generation: { ...generation, status: "completed", timings: apiTimings } });
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
