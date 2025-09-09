import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.SIMLI_API_KEY;
  const avatarId = process.env.SIMLI_AVATAR_ID || "c0736bf4-ab63-4795-8983-7a9377c93ecb";
  
  if (!apiKey || !avatarId) {
    return NextResponse.json({ error: "missing_env", haveApiKey: !!apiKey, haveAvatarId: !!avatarId }, { status: 500 });
  }

  // Must be an Origin value (scheme + host [+ port])
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  // First try the E2E session token endpoint
  const upstream = await fetch("https://api.simli.ai/createE2ESessionToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      simliAPIKey: apiKey,
      avatarID: avatarId
    }),
    cache: "no-store",
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json({ error: "simli_token_error", status: upstream.status, originSent: origin, details: text }, { status: 500 });
  }

  const data = JSON.parse(text);
  console.log("Token response from Simli:", data);
  
  return NextResponse.json({ 
    token: data.token || data.session_token || data.sessionToken,
    avatarid: avatarId 
  }, { 
    headers: { "Cache-Control": "no-store" } 
  });
}