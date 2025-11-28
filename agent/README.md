# Squatch LiveKit Agent

This is the Python agent for the SquatchChat interactive Sasquatch using LiveKit, Simli face, and ElevenLabs voice.

## Required Environment Variables

You need to add these to Railway:

### From LiveKit Cloud (https://cloud.livekit.io):
1. Sign up for a LiveKit Cloud account
2. Create a new project
3. Go to Settings → Keys to get these:
   - `LIVEKIT_URL` - Your LiveKit server URL (format: wss://your-project.livekit.cloud)
   - `LIVEKIT_API_KEY` - Your API key
   - `LIVEKIT_API_SECRET` - Your API secret

### From OpenAI (https://platform.openai.com):
1. Sign in to your OpenAI account
2. Go to API keys section
3. Create new secret key:
   - `OPENAI_API_KEY` - Your OpenAI API key

### From Deepgram (https://console.deepgram.com):
1. Sign up for a Deepgram account
2. Go to API Keys section
3. Create new API key:
   - `DEEPGRAM_API_KEY` - Your Deepgram API key for speech-to-text

### From ElevenLabs (https://elevenlabs.io):
1. Sign in to your ElevenLabs account
2. Go to Profile → API Key
3. Get your API key and voice ID:
   - `ELEVENLABS_API_KEY` - Your ElevenLabs API key
   - `ELEVENLABS_VOICE_ID` - The voice ID you want to use for Squatch

### Already in Railway:
- `SIMLI_API_KEY` - (already set)
- `SIMLI_FACE_ID` - (already set)

## Local Testing

1. Install Python 3.11 or newer

2. Create virtual environment:
```bash
cd agent
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file:
```bash
LIVEKIT_URL=your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key
DEEPGRAM_API_KEY=your-deepgram-key
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id
SIMLI_API_KEY=your-simli-key
SIMLI_FACE_ID=your-face-id
```

5. Run locally:
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

3. From the agent directory, deploy:
```bash
cd agent
livekit-cli cloud agent deploy
```

4. Follow the prompts to select your project

## Testing the Agent

1. Make sure all environment variables are added to Railway
2. Visit your deployed SquatchChat site
3. Click "Start Chat" button
4. The Squatch avatar should appear and respond to voice input

## Architecture

- **Speech-to-Text**: Deepgram Nova-3 model for accurate voice recognition
- **Language Model**: OpenAI GPT-4o for intelligent responses
- **Text-to-Speech**: ElevenLabs with your chosen voice ID
- **Visual Avatar**: Simli face rendering
- **Voice Activity Detection**: Silero VAD for detecting speech
- **Knowledge Base**: Custom persona and facts loaded from kb/ folder