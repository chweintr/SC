import { NextRequest } from 'next/server';
import { getSimliCredentials } from '@/lib/simli';

export const dynamic = 'force-dynamic';

export async function POST() {
  const adminKill = process.env.KILL_SWITCH === 'true';
  if (adminKill) return new Response('Service unavailable', { status: 503 });
  try {
    const { apiKey, faceId } = await getSimliCredentials();
    // Return credentials for client to use directly with SDK
    return new Response(JSON.stringify({
      apiKey,
      faceId,
    }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch (err) {
    console.error('Simli credentials error:', err);
    return new Response(JSON.stringify({ error: 'Failed to get credentials', details: err instanceof Error ? err.message : 'Unknown error' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}


