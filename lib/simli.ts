type IceServer = { urls: string | string[]; username?: string; credential?: string };

export type SimliSessionResponse = {
  sessionToken: string;
  iceConfig: { iceServers: IceServer[] };
};

export async function createSimliSession(): Promise<SimliSessionResponse> {
  const res = await fetch(`${process.env.SIMLI_API_BASE ?? 'https://api.simli.ai'}/v1/session`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.SIMLI_API_KEY ?? ''}`,
    },
    body: JSON.stringify({ faceId: process.env.SIMLI_FACE_ID }),
    // Never cache
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Simli session failed: ${res.status}`);
  }
  const data = await res.json();
  return { sessionToken: data.sessionToken, iceConfig: data.iceConfig } as SimliSessionResponse;
}


