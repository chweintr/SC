import { NextRequest, NextResponse } from "next/server";
export function GET(req: NextRequest) {
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  return NextResponse.json({
    hasApiKey: !!process.env.SIMLI_API_KEY,
    hasAgentId: !!process.env.SIMLI_AGENT_ID,
    originSeen: origin,
    node: process.version,
  });
}