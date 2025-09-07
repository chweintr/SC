# Squatch LiveKit Agent

This is the Python agent for the SquatchChat interactive Sasquatch using LiveKit and Simli face with OpenAI realtime model.

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

## Notes

- Uses OpenAI's realtime model with "alloy" voice
- Simli provides the visual avatar
- Knowledge base and persona are loaded from kb/ folder