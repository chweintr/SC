// Simplified approach - let the SDK handle everything
export async function getSimliCredentials() {
  const apiKey = process.env.SIMLI_API_KEY;
  const faceId = process.env.SIMLI_FACE_ID;
  
  if (!apiKey || !faceId) {
    throw new Error('Missing SIMLI_API_KEY or SIMLI_FACE_ID');
  }
  
  console.log('Simli credentials ready:', {
    apiKeyLength: apiKey.length,
    faceId: faceId
  });
  
  return { apiKey, faceId };
}


