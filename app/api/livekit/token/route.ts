import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const { identity = "web-" + Math.random().toString(36).slice(2), room = "squatch" } =
    await req.json().catch(() => ({}));

  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
    return NextResponse.json({ error: "Missing LiveKit server env" }, { status: 500 });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity }
  );
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();
  return NextResponse.json({ token, url: process.env.LIVEKIT_URL!, room, identity }, { headers: { "Cache-Control": "no-store" } });
}