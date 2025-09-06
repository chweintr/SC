import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
  const FACE_ID = process.env.SIMLI_FACE_ID;
  
  if (!SIMLI_API_KEY || !FACE_ID) {
    return NextResponse.json({ error: "Missing SIMLI_API_KEY or SIMLI_FACE_ID" }, { status: 500 });
  }

  try {
    // First get or create the agent
    const agentRes = await fetch(new URL('/api/simli/agent', req.url).toString());
    if (!agentRes.ok) {
      throw new Error('Failed to get agent ID');
    }
    const { agentId } = await agentRes.json();

    // Then create the token
    const origin = new URL(req.url).origin;
    const tokenRes = await fetch("https://api.simli.ai/auto/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expiryStamp: Math.floor(Date.now() / 1000) + 3600,
        simliAPIKey: SIMLI_API_KEY,
        originAllowList: [origin],
        createTranscript: true
      })
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json({ error: `token error: ${text}` }, { status: 500 });
    }

    const { token } = await tokenRes.json();
    return NextResponse.json({ token, agentid: agentId });
    
  } catch (err) {
    console.error('Token route error:', err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Failed to create token' 
    }, { status: 500 });
  }
}