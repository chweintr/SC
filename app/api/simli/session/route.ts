import { NextRequest } from 'next/server';
import { createSimliSession } from '@/lib/simli';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  const adminKill = process.env.KILL_SWITCH === 'true';
  if (adminKill) return new Response('Service unavailable', { status: 503 });
  try {
    if (!process.env.SIMLI_API_KEY || !process.env.SIMLI_FACE_ID) {
      return new Response('Misconfigured', { status: 500 });
    }
    const session = await createSimliSession();
    return new Response(JSON.stringify(session), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch (err) {
    return new Response('Failed to create session', { status: 500 });
  }
}


