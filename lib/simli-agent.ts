export async function getOrCreateAgent(apiKey: string, faceId: string) {
  console.log('getOrCreateAgent - Starting with faceId:', faceId);
  
  // First, try to list existing agents
  const listRes = await fetch('https://api.simli.ai/agent', {
    method: 'GET',
    headers: {
      'x-simli-api-key': apiKey,
    },
  });
  
  console.log('getOrCreateAgent - List agents response:', listRes.status);
  
  if (listRes.ok) {
    const agents = await listRes.json();
    console.log('getOrCreateAgent - Found agents:', agents.length);
    
    // Find agent with matching face_id
    const existingAgent = agents.find((agent: { face_id: string; id: string }) => agent.face_id === faceId);
    
    if (existingAgent) {
      console.log('getOrCreateAgent - Found existing agent:', existingAgent.id);
      return { agentId: existingAgent.id };
    }
  } else {
    const errorText = await listRes.text();
    console.error('getOrCreateAgent - Failed to list agents:', listRes.status, errorText);
  }
  
  // No existing agent found, create one
  console.log('getOrCreateAgent - Creating new agent for face:', faceId);
  const createRes = await fetch('https://api.simli.ai/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-simli-api-key': apiKey,
    },
    body: JSON.stringify({
      face_id: faceId,
      name: 'Sasquatch',
    }),
  });
  
  if (!createRes.ok) {
    const error = await createRes.text();
    console.error('getOrCreateAgent - Failed to create agent:', createRes.status, error);
    throw new Error(`Failed to create agent: ${error}`);
  }
  
  const newAgent = await createRes.json();
  console.log('getOrCreateAgent - Created new agent:', newAgent.id);
  
  return { agentId: newAgent.id };
}