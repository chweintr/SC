# Simli Widget Integration Documentation

## Overview
This project uses the Simli widget with server-side authentication to create an interactive avatar experience. We use the widget approach with avatar IDs from the Simli dashboard.

## Current Implementation

### Widget Approach
We use the Simli widget (`<simli-widget>`) which handles:
- WebRTC connections
- Audio/video streaming
- User interface (Start/Stop buttons)
- Session management

### Authentication Pattern
1. Backend creates E2E session tokens via `/createE2ESessionToken`
2. Frontend loads the widget with the token
3. Widget handles all WebRTC and streaming logic

## API Endpoints

### Backend Route: `/api/simli/token`
```typescript
// Creates E2E session token for the widget
POST https://api.simli.ai/createE2ESessionToken
Body: {
  simliAPIKey: process.env.SIMLI_API_KEY,
  avatarID: process.env.SIMLI_AVATAR_ID
}
```

### Required Environment Variables:
- `SIMLI_API_KEY` - Your Simli API key
- `SIMLI_AVATAR_ID` - Avatar ID from Simli dashboard (e.g., c0736bf4-ab63-4795-8983-7a9377c93ecb)

## Frontend Implementation

### Loading the Widget
```javascript
// 1. Download widget script locally
// Save https://app.simli.com/simli-widget/index.js to public/simli/widget.js

// 2. Load in layout.tsx
<Script src="/simli/widget.js" strategy="afterInteractive" />

// 3. Create widget element
const el = document.createElement("simli-widget");
el.token = token;
el.avatarid = avatarid;
el.avatarId = avatarid;  // Try multiple property names
el.agentId = avatarid;    // For compatibility
el.overlay = false;
```

### Widget Styling
- Green "Summon" button: `#10b981`
- Pink "Dismiss" button: `#ec4899`
- Black background to hide borders
- Custom CSS to override button text

### Responsive Positioning
```css
position: fixed;
left: 50%;
top: 52%;
width: 25vw;
height: 25vw;
transform: translate(-50%, -50%);
```

## Common Issues & Solutions

### "Invalid API key"
- Verify `SIMLI_API_KEY` in Railway matches Simli dashboard
- No extra spaces or quotes in environment variable

### "Agent not found" 
- Widget expects properties: `avatarid`, `avatarId`, `agentId`
- Set all variants to ensure compatibility

### CSP Errors
Required CSP headers:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
connect-src 'self' https://api.simli.ai https://*.simli.ai wss: https://*.daily.co;
img-src 'self' data: blob: https://www.simli.com https://app.simli.com;
frame-src 'self' https://*.daily.co;
```

## Audio Features
- Background video: `/video/hero_16x9.mp4`
- Ambient sounds: `/audio/enchanted-forest.mp3` (volume: 0.2)

## References
- Get Avatar ID from: https://app.simli.com/avatars/[avatar-id]
- Simli API key from: https://app.simli.com/apikey