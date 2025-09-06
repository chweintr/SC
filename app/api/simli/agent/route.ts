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
    // First, try to list existing agents
    const listRes = await fetch('https://api.simli.ai/agent', {
      method: 'GET',
      headers: {
        'x-simli-api-key': apiKey,
      },
    });
    
    if (listRes.ok) {
      const agents = await listRes.json();
      // Find agent with matching face_id
      const existingAgent = agents.find((agent: { face_id: string; id: string }) => agent.face_id === faceId);
      
      if (existingAgent) {
        console.log('Found existing agent:', existingAgent.id);
        return new Response(JSON.stringify({ agentId: existingAgent.id }), {
          headers: { 'content-type': 'application/json' },
        });
      }
    }
    
    // No existing agent found, create one
    console.log('Creating new agent for face:', faceId);
    const createRes = await fetch('https://api.simli.ai/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-simli-api-key': apiKey,
      },
      body: JSON.stringify({
        face_id: faceId,
        name: 'Sasquatch',
        // Add any other agent configuration here
      }),
    });
    
    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Failed to create agent: ${error}`);
    }
    
    const newAgent = await createRes.json();
    console.log('Created new agent:', newAgent.id);
    
    return new Response(JSON.stringify({ agentId: newAgent.id }), {
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