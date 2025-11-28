
export const dynamic = 'force-dynamic';

export async function POST() {
  const adminKill = process.env.KILL_SWITCH === 'true';
  if (adminKill) return new Response('Service unavailable', { status: 503 });
  
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  if (!apiKey || !faceId) {
    return new Response(JSON.stringify({ error: 'Missing Simli configuration' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
  
  // Return credentials for the client to use
  return new Response(JSON.stringify({
    apiKey,
    faceId,
  }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}


