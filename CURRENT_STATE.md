# SquatchChat - Current State & Known Issues

## ✅ Working Features (as of latest deployment)

### Core Functionality
- **Idle Video**: Bigfoot idle video (`squatch-idle.mp4`) loops in the screen window until user interaction
- **Simli Integration**: Clicking red button triggers Simli interactive chat
- **User Instructions**: "PRESS RED BUTTON" text appears near button initially
- **Loading Feedback**: Gold spinning wheel appears on button when clicked (6 second timeout)
- **Connecting Messages**: Random messages during connection ("Squatch is looking for the unmute button...", etc.)
- **Audio**: Ambient forest sounds with device-specific volume (15% mobile, 25% desktop)

### Visual Design
- Background forest video (`hero_16x9.mp4`) plays full screen
- Steampunk overlay frame (`Overlay_9.png`) creates the device illusion
- ClickZone component detects clicks on red button area and triggers Simli
- All UI elements properly layered with correct z-index values

### Tested & Working On
- ✅ iPhone (vertical/portrait mode)
- ✅ MacBook Pro (full screen)
- ⚠️ iPad & other orientations have scaling issues (see Known Issues)

## ⚠️ Known Issues

### Scaling Problems
**Issue**: When browser window is scaled/resized, the overlay and video widgets don't scale proportionally together
- Overlay uses `objectFit: "cover"` 
- Widget uses `vw` units
- They scale at different rates causing misalignment
- Reveals incorrectly sized Simli and idle video when scaled

**Current Workaround**: App works well at normal sizes - don't scale the window

**Future Fix**: See FUTURE_ENHANCEMENTS.md for responsive scaling solution

### Simli Button Visibility
- Simli's native buttons are hidden via CSS
- ClickZone component programmatically clicks the hidden button
- Red button on overlay image is at 75% left, 61% top
- ClickZone positioned at same coordinates to intercept clicks

### Audio Behavior
- Audio autoplay may be blocked by browser
- Falls back to playing on first user interaction
- Volume adjusted for mobile (15%) vs desktop (25%)

## 🏗️ Architecture

### Component Structure
```
HeroScene (main container)
├── DebugOverlay (optional ?debug=true)
├── MobileSoundToggle (audio controls)
├── ClickZone (invisible button overlay - mobile only)
├── Background video (hero_16x9.mp4)
├── Idle video (squatch-idle.mp4) 
├── SimliSquare (Simli widget wrapper)
├── Overlay image (Overlay_9.png)
├── Loading spinner (gold, z-index 1000)
├── Instructions text ("PRESS RED BUTTON")
└── Connecting message (random, z-index 1000)
```

### Key Files
- `components/HeroScene.tsx` - Main scene with all UI elements
- `components/SimliSquare.tsx` - Simli widget integration with hidden UI
- `components/ClickZone.tsx` - Mobile click detection for red button
- `components/MobileSoundToggle.tsx` - Audio mute/unmute control
- `public/Overlay_9.png` - Device frame overlay (1408x736px)
- `public/squatch-idle.mp4` - Idle Bigfoot video
- `public/video/hero_16x9.mp4` - Background forest video

### Widget Sizing (Current - Working)
- Mobile (<640px): `85vw`, top: `52%`
- Tablet (640-1024px): `41vw`, top: `50%`
- Desktop (>1024px): `27vw`, top: `50%`

### Environment Variables (Railway)
All API keys stored in Railway (not in code):
- `SIMLI_API_KEY`
- `DATABASE_URL`
- LiveKit, OpenAI, Deepgram, ElevenLabs keys (for agent)

## 🔧 Development Notes

### Testing Locally
```bash
npm run dev  # Starts on localhost:3000
```

### Important: Mock Mode
- If `SIMLI_API_KEY` is missing in dev, returns mock token
- Allows UI development without API credentials
- Check `app/api/simli/token/route.ts`

### Deployment
```bash
git push  # Railway auto-deploys from main branch
```

### Orientation Lock
- iOS: `Info.plist` set to portrait only
- PWA: `manifest.json` has `"orientation": "portrait"`
- Next.js: Viewport configured but `orientation` property not supported

## 📝 Recent Changes (Last Session)

1. **User Instructions Added**
   - "PRESS RED BUTTON" text near button
   - Random connecting messages for variety
   - Positioned at z-index 1000 for visibility

2. **Loading Spinner Implemented**
   - Gold/yellow spinning circle on button when clicked
   - 6 second timeout (auto-hides even if Simli doesn't connect)
   - z-index 1000 to be visible above overlay

3. **Audio Volume Adjusted**
   - Was 0.2% (inaudible) 
   - Now 15% mobile, 25% desktop
   - Device-specific for better UX

4. **Button Detection Enhanced**
   - Listens for custom 'squatch-button-clicked' event
   - Backup click listener for button area (65-85% x, 50-70% y)
   - Works even if ClickZone doesn't fire

## 🚀 Next Steps

See `FUTURE_ENHANCEMENTS.md` for planned improvements:
- Button color state changes (red → yellow → green)
- Responsive scaling solution for all devices
- Additional connection feedback options
