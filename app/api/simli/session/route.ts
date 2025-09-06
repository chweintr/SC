import { NextRequest } from 'next/server';
import { createSimliSession } from '@/lib/simli';

export const dynamic = 'force-dynamic';

export async function POST() {
  const adminKill = process.env.KILL_SWITCH === 'true';
  if (adminKill) return new Response('Service unavailable', { status: 503 });
  try {
    const session = await createSimliSession();
    // Return in the format expected by the client
    return new Response(JSON.stringify({
      sessionToken: session.session_token,
    }), {
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


