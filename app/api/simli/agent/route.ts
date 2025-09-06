import { getOrCreateAgent } from '@/lib/simli-agent';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  if (!apiKey || !faceId) {
    return new Response(JSON.stringify({ error: 'Missing configuration' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
  
  try {
    const result = await getOrCreateAgent(apiKey, faceId);
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Agent error:', err);
    return new Response(JSON.stringify({ error: 'Failed to get/create agent' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}