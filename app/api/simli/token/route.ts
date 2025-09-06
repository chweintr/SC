import { NextRequest, NextResponse } from "next/server";

async function getOrCreateAgentId(apiKey: string): Promise<string> {
  // 1) If env has SIMLI_AGENT_ID, use it
  if (process.env.SIMLI_AGENT_ID) return process.env.SIMLI_AGENT_ID;

  // 2) Try to find an existing agent by face_id or by name "Sasquatch"
  const list = await fetch("https://api.simli.ai/agent", {
    headers: { "x-simli-api-key": apiKey },
    cache: "no-store",
  });
  const txt = await list.text();
  if (!list.ok) throw new Error(`agent_list_failed: ${list.status} ${txt}`);
  let agents: any[] = [];
  try { agents = JSON.parse(txt); } catch {}
  const faceId = process.env.SIMLI_FACE_ID;
  let found = agents.find(a => faceId ? a?.face_id === faceId : a?.name?.toLowerCase() === "sasquatch");
  if (found?.id) return found.id;

  // 3) Create a new agent if we have a face_id
  if (!faceId) throw new Error("no_agent_id_and_no_face_id");
  const payload: any = { face_id: faceId, name: "Sasquatch" };
  if (process.env.ELEVENLABS_VOICE_ID) {
    payload.voice_provider = "elevenlabs";
    payload.voice_id = process.env.ELEVENLABS_VOICE_ID;
  }
  const create = await fetch("https://api.simli.ai/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-simli-api-key": apiKey },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const ctext = await create.text();
  if (!create.ok) throw new Error(`agent_create_failed: ${create.status} ${ctext}`);
  const obj = JSON.parse(ctext);
  if (!obj?.id) throw new Error(`agent_create_bad_response: ${ctext}`);
  return obj.id;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.SIMLI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_env", hasApiKey: false }, { status: 500 });
  }

  let agentId: string;
  try { agentId = await getOrCreateAgentId(apiKey); }
  catch (e: any) {
    return NextResponse.json({ error: "agent_resolution_failed", details: String(e?.message ?? e) }, { status: 500 });
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