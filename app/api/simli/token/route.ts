import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const apiKey = process.env.SIMLI_API_KEY;
  const agentId = process.env.SIMLI_AGENT_ID;
  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "missing_env", hasApiKey: !!apiKey, hasAgentId: !!agentId },
      { status: 500 }
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const upstream = await fetch("https://api.simli.ai/auto/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-simli-api-key": apiKey,
    },
    body: JSON.stringify({
      expiryStamp: Math.floor(Date.now() / 1000) + 1800,
      originAllowList: [origin, "http://localhost:3000"],
      createTranscript: true,
    }),
    cache: "no-store",
  });

  const raw = await upstream.text();
  if (!upstream.ok) {
    // Surface Simli's exact error so we can fix quickly
    return NextResponse.json(
      {
        error: "simli_token_error",
        status: upstream.status,
        originSent: origin,
        details: raw, // often includes "origin not allowed", "invalid api key", etc.
      },
      { status: 500 }
    );
  }

  let token: string | undefined;
  try { 
    const parsed = JSON.parse(raw);
    token = parsed.session_token || parsed.token;
  } catch {}
  if (!token) {
    return NextResponse.json({ error: "bad_token_response", raw }, { status: 500 });
  }

  return NextResponse.json({ token, agentid: agentId }, { headers: { "Cache-Control": "no-store" } });
}