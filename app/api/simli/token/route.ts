import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey =
    process.env.SIMLI_API_KEY ||
    process.env.SIMLI_APIKEY ||
    process.env.NEXT_PUBLIC_SIMLI_API_KEY;
  const avatarId =
    process.env.SIMLI_AGENT_ID ||
    process.env.SIMLI_AVATAR_ID ||
    process.env.NEXT_PUBLIC_SIMLI_AGENT_ID ||
    process.env.NEXT_PUBLIC_SIMLI_AVATAR_ID ||
    "c0736bf4-ab63-4795-8983-7a9377c93ecb";
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, return mock response if API key is missing (for UI development)
  if (!apiKey && isDevelopment) {
    console.log("Development mode: Returning mock Simli token response");
    return NextResponse.json({
      token: "mock_development_token_" + Date.now(),
      avatarid: avatarId,
      avatarId: avatarId,
      agentId: avatarId,
      agentid: avatarId,
      _isMock: true
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (!apiKey || !avatarId) {
    return NextResponse.json(
      {
        error: "missing_env",
        haveApiKey: !!apiKey,
        haveAvatarId: !!avatarId,
        expected: ["SIMLI_API_KEY", "SIMLI_AGENT_ID (or SIMLI_AVATAR_ID)"],
      },
      { status: 500 }
    );
  }

  // Must be an Origin value (scheme + host [+ port]).
  // On same-origin fetches the Origin header may be absent, so fall back to
  // the request URL's origin (which is the server's own origin).
  const origin = req.headers.get("origin")
    || req.headers.get("referer")?.replace(/\/[^/]*$/, "")
    || new URL(req.url).origin;
  const originAllowList = Array.from(
    new Set([
      origin,
      new URL(req.url).origin,           // always include the server's own origin
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:8080",
      "https://localhost:8080",
    ])
  );
  console.log("Token request origins:", { origin, originAllowList });

  const tryE2E = async () => {
    const upstream = await fetch("https://api.simli.ai/createE2ESessionToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-simli-api-key": apiKey,
      },
      body: JSON.stringify({
        simliAPIKey: apiKey,
      }),
      cache: "no-store",
    });
    const text = await upstream.text();
    return { ok: upstream.ok, status: upstream.status, text, endpoint: "createE2ESessionToken" };
  };

  const tryAutoToken = async () => {
    const upstream = await fetch("https://api.simli.ai/auto/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-simli-api-key": apiKey,
      },
      body: JSON.stringify({
        simliAPIKey: apiKey,
        expiryStamp: Math.floor(Date.now() / 1000) + 1800,
        originAllowList,
        createTranscript: true,
        avatarID: avatarId,
        agentID: avatarId,
      }),
      cache: "no-store",
    });
    const text = await upstream.text();
    return { ok: upstream.ok, status: upstream.status, text, endpoint: "auto/token" };
  };

  // Try auto/token FIRST — it accepts originAllowList, which the widget
  // needs to make cross-origin XHR to api.simli.ai from the browser.
  // createE2ESessionToken doesn't accept originAllowList, so its tokens
  // get rejected with 401 "Origin not allowed".
  const first = await tryAutoToken();
  let response = first;
  if (!response.ok) {
    response = await tryE2E();
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "simli_token_error",
        status: response.status,
        originSent: origin,
        endpoint: response.endpoint,
        details: response.text,
      },
      { status: 500 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(response.text);
  } catch {
    return NextResponse.json(
      {
        error: "simli_token_parse_error",
        endpoint: response.endpoint,
        details: response.text,
      },
      { status: 500 }
    );
  }

  const token = (data.token || data.session_token || data.sessionToken) as string | undefined;
  const upstreamAgentId = (data.agentid || data.agentId || data.avatarid || data.avatarId) as string | undefined;

  if (!token) {
    return NextResponse.json(
      {
        error: "simli_missing_token",
        endpoint: response.endpoint,
        details: data,
      },
      { status: 500 }
    );
  }

  console.log("Token response from Simli:", { endpoint: response.endpoint });

  return NextResponse.json(
    {
      token,
      avatarid: upstreamAgentId || avatarId,
      avatarId: upstreamAgentId || avatarId,
      agentId: upstreamAgentId || avatarId,
      agentid: upstreamAgentId || avatarId,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
