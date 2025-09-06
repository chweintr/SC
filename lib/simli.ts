type IceServer = { urls: string | string[]; username?: string; credential?: string };

export type SimliSessionResponse = {
  session_token: string;
  iceServers: IceServer[];
};

export async function createSimliSession(): Promise<SimliSessionResponse> {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  if (!apiKey || !faceId) {
    throw new Error('Missing SIMLI_API_KEY or SIMLI_FACE_ID');
  }
  
  // Log API key info for debugging
  console.log('Creating Simli session with:', {
    apiKeyPrefix: apiKey.substring(0, 10) + '...',
    apiKeyLength: apiKey.length,
    faceId: faceId
  });
  
  // Validate API key format
  if (apiKey.length < 20) {
    console.warn('Warning: API key seems too short. Simli API keys are typically longer.');
  }
  
  // Step 1: Create audio to video session
  // Try different authentication methods
  const sessionRes = await fetch('https://api.simli.ai/startAudioToVideoSession', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey, // Try as header too
    },
    body: JSON.stringify({
      apiKey, // Keep in body as well
      faceId,
      handleSilence: true,
      maxSessionLength: 600,
      maxIdleTime: 60,
    }),
    cache: 'no-store',
  });
  
  if (!sessionRes.ok) {
    const errorText = await sessionRes.text();
    console.error('Simli startAudioToVideoSession error:', {
      status: sessionRes.status,
      body: errorText
    });
    throw new Error(`Simli session failed: ${sessionRes.status} - ${errorText}`);
  }
  
  const sessionData = await sessionRes.json();
  console.log('Got session token:', !!sessionData.session_token);
  
  // Step 2: Get ICE servers (required for server-side auth)
  const iceRes = await fetch('https://api.simli.ai/getIceServer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
    cache: 'no-store',
  });
  
  if (!iceRes.ok) {
    const errorText = await iceRes.text();
    console.error('Simli getIceServer error:', {
      status: iceRes.status,
      body: errorText
    });
    throw new Error(`Simli ICE server failed: ${iceRes.status} - ${errorText}`);
  }
  
  const iceData = await iceRes.json();
  console.log('Got ICE servers config');
  
  return {
    session_token: sessionData.session_token,
    iceServers: iceData,
  };
}


