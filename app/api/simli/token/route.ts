import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey  = process.env.SIMLI_API_KEY;
  const agentId = process.env.SIMLI_AGENT_ID;
  if (!apiKey || !agentId) return NextResponse.json({ error:"missing_env" }, { status:500 });

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const r = await fetch("https://api.simli.ai/auto/token", {
    method: "POST",
    headers: { "Content-Type":"application/json", "x-simli-api-key": apiKey },
    body: JSON.stringify({
      expiryStamp: Math.floor(Date.now()/1000) + 1800,
      originAllowList: [origin, "http://localhost:3000"],
      createTranscript: true
    }),
    cache: "no-store"
  });

  const text = await r.text();
  if (!r.ok) return NextResponse.json({ error:"simli_token_error", status:r.status, details:text }, { status:500 });

  let token: string | undefined;
  try { token = JSON.parse(text).token; } catch {}
  if (!token) return NextResponse.json({ error:"bad_token_response", details:text }, { status:500 });

  return NextResponse.json({ token, agentid: agentId }, { headers: { "Cache-Control":"no-store" } });
}