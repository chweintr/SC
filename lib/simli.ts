type IceServer = { urls: string | string[]; username?: string; credential?: string };

export type SimliSessionResponse = {
  sessionToken: string;
  iceConfig: { iceServers: IceServer[] };
};

export async function createSimliSession(): Promise<SimliSessionResponse> {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  const apiBase = process.env.SIMLI_API_BASE ?? 'https://api.simli.ai';
  
  console.log('Creating Simli session with:', {
    apiBase,
    faceId,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length
  });
  
  const res = await fetch(`${apiBase}/v1/session`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey ?? ''}`,
    },
    body: JSON.stringify({ faceId }),
    // Never cache
    cache: 'no-store',
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Simli API error response:', {
      status: res.status,
      statusText: res.statusText,
      body: errorText
    });
    throw new Error(`Simli session failed: ${res.status} - ${errorText || res.statusText}`);
  }
  
  const data = await res.json();
  return { sessionToken: data.sessionToken, iceConfig: data.iceConfig } as SimliSessionResponse;
}


