# Simli Integration Requirements

## Non-negotiables (product + UX)

**Avatar + brain**: Simli avatar, OpenAI gpt-4.1 or 4o, ElevenLabs specific voice, my Simli KB.

**UI stack (exact order)**:
1. Full-bleed 16:9 background video (covers entire viewport).
2. Square avatar window (absolute/fixed, pixel-perfect position).
3. Full-page PNG overlay with a transparent cutout that reveals the square.

**Interaction**: Push-to-talk. Low chatter. Short sessions.

**No iframes to app.simli.com**. Avatar must render inside our page.

## Integration path (pick A; fall back to B only if blocked)

### A) Agent + widget (preferred; preserves my KB + voice + LLM)

Load self-hosted `/simli/widget.js` once (CSP friendly).

Backend route `/api/simli/token`:
- POST `https://api.simli.ai/auto/token`
- Body must include:
  - `simliAPIKey: process.env.SIMLI_API_KEY`
  - `expiryStamp: now + 1800`
  - `originAllowList: [request origin, "http://localhost:3000", "https://localhost:8080", "<prod domain>"]`
  - `createTranscript: true`
- Return `{ token, agentid }`. On failure, return Simli's raw error in JSON.

Render:
```html
<simli-widget token="…" agentid="…" overlay="false" style="display:block;width:100%;height:100%"></simli-widget>
```

Env vars allowed (no more):
- `SIMLI_API_KEY` (required)
- `SIMLI_AGENT_ID` (preferred). If missing, server may look up or create an agent using:
  - `SIMLI_FACE_ID` (required to auto-create)
  - `ELEVENLABS_VOICE_ID` (optional; used on create)

### B) LiveKit fallback (only if A is unavailable)

- Agent publishes Simli face video to a LiveKit room; site subscribes.
- LLM: OpenAI 4.1/4o. TTS: ElevenLabs streaming (my voice). STT: OpenAI Realtime (or Deepgram later).
- Minimal server route to mint LiveKit tokens. No Docker.

## CSP + loading rules

- Keep `script-src 'self'` (since widget.js is self-hosted).
- Allow connections: `connect-src 'self' https://api.simli.ai wss:`
- Media: `media-src 'self' blob:`; Images: `img-src 'self' data: blob:`
- Do not allow `frame-src` to external domains. We don't iframe.

## Mobile/WebView

- Autoplay muted; unmute on tap or during push-to-talk.
- Microphone permission must be user-initiated.

## Latency targets (guide, not fluff)

- STT final: < 300–500 ms after end of speech.
- First TTS audio chunk: < 400–700 ms.
- Keep audio 16 kHz mono. Stream TTS.

## Acceptance tests (ship gate)

1. `/simli/widget.js` serves 200 from our domain.
2. `/api/simli/token` returns 200 with `{ token, agentid }`.
3. Page shows avatar in the square hole beneath the overlay.
4. Speaks with my ElevenLabs voice; answers with OpenAI 4.1/4o; uses my KB.
5. No iframe/CSP errors in console.
6. Push-to-talk works on desktop and iOS Safari.

## Error surfaces (no guessing)

If token mint fails, show the exact JSON from Simli (e.g., "origin not allowed", "invalid key", "missing simliAPIKey") and stop.

## Cost control

- Session cap (e.g., 10 min).
- Push-to-talk only (no hot mic).
- Rate-limit token route.