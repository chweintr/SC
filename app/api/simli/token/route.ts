import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAgent } from '@/lib/simli-agent';

export async function GET(req: NextRequest) {
  const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
  const SIMLI_FACE_ID = process.env.SIMLI_FACE_ID;
  if (!SIMLI_API_KEY || !SIMLI_FACE_ID) {
    return NextResponse.json(
      { error: "missing_env", details: "SIMLI_API_KEY or SIMLI_FACE_ID" },
      { status: 500 }
    );
  }

  try {
    // First get or create agent from face ID
    const { agentId } = await getOrCreateAgent(SIMLI_API_KEY, SIMLI_FACE_ID);

    // Allow current origin + common dev origins
    const reqOrigin = req.headers.get("origin") ?? new URL(req.url).origin;
    const originAllowList = Array.from(
      new Set([reqOrigin, "http://localhost:3000"])
    );

    // Build payload with API key in body
    const payload = {
      simliAPIKey: SIMLI_API_KEY,
      expiryStamp: Math.floor(Date.now() / 1000) + 1800,
      originAllowList,
      createTranscript: true,
    };

    const r = await fetch("https://api.simli.ai/auto/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await r.text();

    if (!r.ok) {
      // TEMP: bubble details to client so you can see exact reason
      return NextResponse.json(
        { error: "simli_token_error", status: r.status, details: text },
        { status: 500 }
      );
    }

    // Expect { token: "..." }
    let token: string | undefined;
    try {
      token = JSON.parse(text)?.token;
    } catch (_) {}
    if (!token) {
      return NextResponse.json(
        { error: "bad_token_response", details: text },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { token, agentid: agentId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error('Token route error:', err);
    return NextResponse.json(
      { error: "agent_error", details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}