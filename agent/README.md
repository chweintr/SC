# Squatch LiveKit Agent

This is the Python agent for the SquatchChat interactive Sasquatch experience using LiveKit, Simli face, OpenAI, and ElevenLabs TTS.

## Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables:
```bash
export LIVEKIT_URL="your-livekit-url"
export LIVEKIT_API_KEY="your-api-key"
export LIVEKIT_API_SECRET="your-api-secret"
export OPENAI_API_KEY="your-openai-key"
export ELEVENLABS_API_KEY="your-elevenlabs-key"
export ELEVENLABS_VOICE_ID="your-voice-id"
export SIMLI_FACE_ID="your-simli-face-id"
```

4. Run the agent:
```bash
python main.py dev
```

## Deployment to LiveKit Cloud

1. Install LiveKit CLI:
```bash
curl -sSL https://get.livekit.io/cli | bash
```

2. Login to LiveKit Cloud:
```bash
livekit-cli cloud login
```

3. Deploy the agent:
```bash
livekit-cli cloud agent deploy --project your-project-name
```

## Required Environment Variables

Add these to your Railway deployment:

- `LIVEKIT_URL` - Your LiveKit server URL (wss://your-project.livekit.cloud)
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `OPENAI_API_KEY` - OpenAI API key for the LLM
- `ELEVENLABS_API_KEY` - ElevenLabs API key for TTS
- `ELEVENLABS_VOICE_ID` - ElevenLabs voice ID for Squatch
- `SIMLI_FACE_ID` - Simli face ID (already set in Railway)
- `SIMLI_API_KEY` - Simli API key (already set in Railway)

## Testing

After deployment, visit your SquatchChat site and click the "Start Chat" button. The agent should connect automatically.