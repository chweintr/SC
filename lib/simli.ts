// Server-side auth approach from JavaScript Auth docs
export async function createSimliSession() {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  if (!apiKey || !faceId) {
    throw new Error('Missing SIMLI_API_KEY or SIMLI_FACE_ID');
  }
  
  // Step 1: Create session (from JavaScript Auth docs)
  const sessionRes = await fetch('https://api.simli.ai/startAudioToVideoSession', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,  // Try API key in header
    },
    body: JSON.stringify({
      apiKey: apiKey,  // Keep in body too
      faceId: faceId,
      handleSilence: true,
      maxSessionLength: 3600,
      maxIdleTime: 600,
    }),
  });
  
  if (!sessionRes.ok) {
    const errorText = await sessionRes.text();
    throw new Error(`Simli session failed: ${sessionRes.status} - ${errorText}`);
  }
  
  const sessionData = await sessionRes.json();
  
  // Step 2: Get ICE config (from JavaScript Auth docs)
  const iceRes = await fetch('https://api.simli.ai/getIceServer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });
  
  if (!iceRes.ok) {
    const errorText = await iceRes.text();
    throw new Error(`ICE server failed: ${iceRes.status} - ${errorText}`);
  }
  
  const iceConfig = await iceRes.json();
  
  return {
    session_token: sessionData.session_token,
    iceConfig,
  };
}


