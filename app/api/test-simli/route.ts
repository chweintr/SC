import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  // Test the API key directly
  try {
    console.log('Testing Simli API key...');
    
    const testRes = await fetch('https://api.simli.ai/startAudioToVideoSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        faceId,
        handleSilence: true,
        maxSessionLength: 10, // Short test session
        maxIdleTime: 5,
      }),
    });
    
    const responseText = await testRes.text();
    
    return new Response(JSON.stringify({
      status: testRes.status,
      statusText: testRes.statusText,
      apiKeyInfo: {
        length: apiKey?.length || 0,
        prefix: apiKey?.substring(0, 8) + '...',
        hasPrefix: apiKey?.includes('_') || false,
      },
      faceId,
      response: responseText,
    }, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Unknown error',
      apiKeyLength: apiKey?.length || 0,
    }, null, 2), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
