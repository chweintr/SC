import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.SIMLI_API_KEY;
  const agentId = process.env.SIMLI_AGENT_ID;
  
  if (!apiKey) {
    return NextResponse.json({ error: "missing_env", hasApiKey: false }, { status: 500 });
  }
  
  if (!agentId) {
    // Provide helpful instructions for creating an agent
    return NextResponse.json({ 
      error: "missing_agent_id",
      help: "Add SIMLI_AGENT_ID to Railway. To create one, run: curl -X POST https://api.simli.ai/agent -H 'Content-Type: application/json' -H 'x-simli-api-key: YOUR_API_KEY' -d '{\"face_id\":\"YOUR_FACE_ID\",\"name\":\"Sasquatch\",\"voice_provider\":\"elevenlabs\",\"voice_id\":\"YOUR_VOICE_ID\"}'",
      hasFaceId: !!process.env.SIMLI_FACE_ID
    }, { status: 500 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const upstream = await fetch("https://api.simli.ai/auto/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-simli-api-key": apiKey },
    body: JSON.stringify({
      expiryStamp: Math.floor(Date.now() / 1000) + 1800,
      originAllowList: [origin, "http://localhost:3000"],
      createTranscript: true
    }),
    cache: "no-store",
  });

  const raw = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "simli_token_error", status: upstream.status, originSent: origin, details: raw },
      { status: 500 }
    );
  }

  let token: string | undefined;
  try { 
    const parsed = JSON.parse(raw);
    token = parsed.session_token || parsed.token;
  } catch {}
  if (!token) return NextResponse.json({ error: "bad_token_response", raw }, { status: 500 });

  return NextResponse.json({ token, agentid: agentId }, { headers: { "Cache-Control": "no-store" } });
}