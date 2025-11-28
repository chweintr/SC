
export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  // Test the API key directly
  try {
    console.log('Testing Simli API key...');
    
    // Try different possible endpoints
    const endpoints = [
      'https://api.simli.ai/startAudioToVideoSession',
      'https://api.simli.com/startAudioToVideoSession', 
      'https://simli.ai/api/startAudioToVideoSession',
      'https://app.simli.ai/api/startAudioToVideoSession'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: ${endpoint}`);
      try {
        const testRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey,
            faceId,
            handleSilence: true,
            maxSessionLength: 10,
            maxIdleTime: 5,
          }),
        });
        
        const responseText = await testRes.text();
        results.push({
          endpoint,
          status: testRes.status,
          statusText: testRes.statusText,
          response: responseText,
          success: testRes.ok
        });
        
        // If we found a working endpoint, return immediately
        if (testRes.ok) {
          return new Response(JSON.stringify({
            success: true,
            workingEndpoint: endpoint,
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
        }
      } catch (err) {
        results.push({
          endpoint,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    // None worked, return all results
    return new Response(JSON.stringify({
      success: false,
      apiKeyInfo: {
        length: apiKey?.length || 0,
        prefix: apiKey?.substring(0, 8) + '...',
        hasPrefix: apiKey?.includes('_') || false,
      },
      faceId,
      results,
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
