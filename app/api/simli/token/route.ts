import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
  const SIMLI_AGENT_ID = process.env.SIMLI_AGENT_ID;
  if (!SIMLI_API_KEY || !SIMLI_AGENT_ID) {
    return NextResponse.json({ error: "Missing SIMLI_API_KEY or SIMLI_AGENT_ID" }, { status: 500 });
  }

  const origin = new URL(req.url).origin; // allow current origin
  const r = await fetch("https://api.simli.ai/auto/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      expiryStamp: Math.floor(Date.now() / 1000) + 3600,
      simliAPIKey: SIMLI_API_KEY,
      originAllowList: [origin],
      createTranscript: true
    })
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: `token error: ${text}` }, { status: 500 });
  }

  const { token } = await r.json();
  return NextResponse.json({ token, agentid: SIMLI_AGENT_ID });
}