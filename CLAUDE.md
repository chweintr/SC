# Simli API Integration Documentation

## Overview
This project uses Simli's JavaScript SDK with server-side authentication to keep API keys secure. The backend creates sessions and fetches ICE servers, while the frontend uses session tokens.

## Authentication Pattern
We use the **server-side authentication** pattern (requires simli-client 1.2.7+):
- Backend keeps the API key secure
- Backend creates sessions via `/startAudioToVideoSession`
- Backend fetches ICE servers via `/getIceServer` (singular, not plural!)
- Frontend receives session_token and iceConfig
- Frontend initializes with session_token instead of apiKey

## API Endpoints

### Simli API Endpoints:
- `POST https://api.simli.ai/startAudioToVideoSession` - Creates a session
- `POST https://api.simli.ai/getIceServer` - Gets ICE servers (NOT getIceServers)

### Required Environment Variables:
- `SIMLI_API_KEY` - Your Simli API key
- `SIMLI_FACE_ID` - The face ID to use

## Frontend Usage
```javascript
// Initialize with session_token (not apiKey)
const simliConfig = {
  apiKey: '',              // Empty when using session_token
  faceID: '',              // Empty when using session_token
  session_token: sessionToken,  // From backend
  handleSilence: true,
  videoRef: videoRef.current,
  audioRef: audioRef.current,
  maxSessionLength: 600,
  maxIdleTime: 60,
  enableConsoleLogs: true,
};

simliClient.Initialize(simliConfig);
simliClient.start(iceServers); // Pass ICE servers from backend
```

## Backend Flow
1. Call `/startAudioToVideoSession` with apiKey and faceId
2. Get session_token from response
3. Call `/getIceServer` with apiKey
4. Return both session_token and iceServers to frontend

## Common Issues
- "Invalid API key" - Check environment variable names (no trailing colons!)
- 404 on ICE servers - Use `/getIceServer` (singular), not `/getIceServers`
- Session fails - Ensure both SIMLI_API_KEY and SIMLI_FACE_ID are set

## References
- [Simli JavaScript SDK Docs](https://docs.simli.com/simli-sdks/javascript-sdk)
- [Simli JavaScript Auth Docs](https://docs.simli.com/simli-sdks/javascript-auth)