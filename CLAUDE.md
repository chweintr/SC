# Simli Widget Integration Documentation

## Overview
This project uses the Simli widget (`<simli-widget>`) in **overlay mode** to create an
interactive Bigfoot avatar experience. The widget runs under a PNG overlay frame, and a
transparent ClickZone button triggers it.

## IDs
- **Agent ID**: `c0736bf4-ab63-4795-8983-7a9377c93ecb` (configured on Simli dashboard, includes face + LLM + TTS)
- **Face ID**: `db457e6f-ac2e-4478-9f75-430ed9fd5a3c` (baked into the agent, also set as attribute on widget for compatibility)

## Architecture (Z-index layers)
1. Background video (`-z-30`)
2. Idle squatch video (`z-[5]`)
3. `<simli-widget>` inside SimliSquare (`z-10`)
4. PNG overlay frame (`z-20`, pointer-events-none)
5. ClickZone invisible button (`z-[60]`)

## Authentication Flow
1. **Backend** (`/api/simli/token`): calls `POST /createE2ESessionToken` (fallback: `POST /auto/token`) with `x-simli-api-key` header
2. **Frontend** (`SimliSquare`): fetches token, creates `<simli-widget overlay="true" agentid="..." token="...">`
3. **Widget**: overlay mode auto-binds to `<button id="simliOverlayBtn">` via `findAndConnectTriggerButton()`
4. On click: widget calls `POST /auto/start/{agentId}` with Bearer token → gets Daily.co roomUrl → joins WebRTC

## Key Files
- `components/HeroScene.tsx` - Main scene, overlay composition, "Start/End Transmission" button
- `components/SimliSquare.tsx` - Mounts widget, injects shadow DOM styles, syncs idle video
- `components/ClickZone.tsx` - Invisible button, dispatches `squatch-button-clicked` events
- `app/api/simli/token/route.ts` - Server-side token creation
- `public/simli/widget.js` - Local copy of Simli widget (modified `startAgentSession`)

## Critical: ClickZone Event Ordering
The widget's native `addEventListener` fires BEFORE React's synthetic `onClick`.
ClickZone must NOT read `widget.isRunning` to decide connect vs disconnect, because
the widget's handler already flipped it. ClickZone tracks its own `intentRef` instead.

## Environment Variables (Railway)
- `SIMLI_API_KEY` - Simli API key (required)
- `SIMLI_AGENT_ID` or `SIMLI_AVATAR_ID` - Agent ID (fallback: hardcoded)
- `SIMLI_FACE_ID` - Face ID (used only by legacy `lib/simli.ts` and `/api/simli/session`)

## Widget Shadow DOM
SimliSquare injects CSS into the widget's shadow root to:
- Hide all chrome (controls, logo, dotted-face)
- Make video fill the container (`object-fit: cover`)
- Force transparent backgrounds
All rules use `!important` to override inline styles set by `handleConnection()`.

## CSP Requirements
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
connect-src 'self' https://api.simli.ai https://*.simli.ai wss: https://*.daily.co;
img-src 'self' data: blob: https://www.simli.com https://app.simli.com;
frame-src 'self' https://*.daily.co;
```
