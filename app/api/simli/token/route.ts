export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.SIMLI_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Simli API key' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
  
  try {
    // Get token from Simli Auto API with correct format
    const response = await fetch('https://api.simli.ai/auto/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expiryStamp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        simliAPIKey: apiKey,
        originAllowList: [
          'http://localhost:3000',
          'https://*.railway.app',
          process.env.PRODUCTION_URL || '',
        ].filter(Boolean),
        createTranscript: true,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Simli Auto token error:', error);
      throw new Error(`Failed to get token: ${response.status}`);
    }
    
    const data = await response.json();
    return new Response(JSON.stringify({ token: data.token || data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Simli Auto error:', err);
    return new Response(JSON.stringify({ error: 'Failed to get token' }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}