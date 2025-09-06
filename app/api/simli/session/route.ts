import { NextRequest } from 'next/server';
import { createSimliSession } from '@/lib/simli';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  const adminKill = process.env.KILL_SWITCH === 'true';
  if (adminKill) return new Response('Service unavailable', { status: 503 });
  try {
    if (!process.env.SIMLI_API_KEY) {
      console.error('Missing SIMLI_API_KEY');
      return new Response(JSON.stringify({ error: 'Missing SIMLI_API_KEY' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    if (!process.env.SIMLI_FACE_ID) {
      console.error('Missing SIMLI_FACE_ID');
      return new Response(JSON.stringify({ error: 'Missing SIMLI_FACE_ID' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
    const session = await createSimliSession();
    return new Response(JSON.stringify(session), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch (err) {
    console.error('Simli session error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create session', details: err instanceof Error ? err.message : 'Unknown error' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}


