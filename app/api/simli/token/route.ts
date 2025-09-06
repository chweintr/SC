import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.SIMLI_API_KEY;
  const agentId = process.env.SIMLI_AGENT_ID;
  
  if (!apiKey) {
    return NextResponse.json({ error: "missing_env", hasApiKey: false }, { status: 500 });
  }
  
  if (!agentId) {
    // If no agent ID, try to create one if we have face ID
    const faceId = process.env.SIMLI_FACE_ID;
    if (!faceId) {
      return NextResponse.json({ 
        error: "missing_agent_id_and_face_id",
        help: "Either set SIMLI_AGENT_ID in Railway, or add SIMLI_FACE_ID to auto-create an agent"
      }, { status: 500 });
    }
    
    // Try to create agent directly (skip listing since it seems broken)
    const payload: any = { 
      face_id: faceId, 
      name: "Sasquatch" 
    };
    
    if (process.env.ELEVENLABS_VOICE_ID) {
      payload.voice_provider = "elevenlabs";
      payload.voice_id = process.env.ELEVENLABS_VOICE_ID;
    }
    
    try {
      const create = await fetch("https://api.simli.ai/agent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "x-simli-api-key": apiKey 
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      
      const createRaw = await create.text();
      if (!create.ok) {
        return NextResponse.json({ 
          error: "agent_create_failed", 
          status: create.status,
          details: createRaw,
          help: "Agent API might not be available. Consider using LiveKit approach instead."
        }, { status: 500 });
      }
      
      const obj = JSON.parse(createRaw);
      const createdAgentId = obj?.id;
      
      if (!createdAgentId) {
        return NextResponse.json({ 
          error: "agent_create_no_id", 
          response: createRaw 
        }, { status: 500 });
      }
      
      // Use the newly created agent ID
      return createTokenWithAgent(apiKey, createdAgentId, req);
    } catch (e: any) {
      return NextResponse.json({ 
        error: "agent_create_exception", 
        details: String(e?.message ?? e) 
      }, { status: 500 });
    }
  }

  return createTokenWithAgent(apiKey, agentId, req);
}

async function createTokenWithAgent(apiKey: string, agentId: string, req: NextRequest) {
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const upstream = await fetch("https://api.simli.ai/auto/token", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "x-simli-api-key": apiKey 
    },
    body: JSON.stringify({
      expiryStamp: Math.floor(Date.now() / 1000) + 1800,
      simliAPIKey: apiKey,
      originAllowList: [
        origin, 
        "http://localhost:3000",
        "https://localhost:8080"
      ],
      createTranscript: true
    }),
    cache: "no-store",
  });

  const raw = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json({
      error: "simli_token_error",
      status: upstream.status,
      originSent: origin,
      details: raw
    }, { status: 500 });
  }

  let token: string | undefined;
  try { 
    const parsed = JSON.parse(raw);
    token = parsed.session_token || parsed.token;
  } catch {}
  
  if (!token) {
    return NextResponse.json({ 
      error: "bad_token_response", 
      raw 
    }, { status: 500 });
  }

  return NextResponse.json({ 
    token, 
    agentid: agentId 
  }, { 
    headers: { "Cache-Control": "no-store" } 
  });
}