# Simli Integration & Workarounds

## Core Architecture
We are using **Option B (LiveKit)** as the primary integration method to have full control over the UI/UX. We do **NOT** use the standard Simli widget UI because it does not fit our "device" aesthetic.

### The "Device" UX
The app is designed to look like a physical "Squatch Communicator" device.
- **Background:** A looping video (`hero_16x9.mp4`) or idle animation (`squatch-idle.mp4`).
- **Overlay:** A static PNG (`Overlay_9.png`) sits on top of everything, acting as the device frame.
- **Viewport:** The "screen" of the device is a transparent cutout in the overlay.
- **Layout:**
  - **Mobile:** Full-screen vertical (Portrait).
  - **Desktop:** 16:9 aspect ratio box centered on screen.

## Critical Workarounds & Implementation Details

### 1. The "Red Button" Interaction
We do not use standard HTML buttons.
- **Visual:** The "Red Button" is part of the static `Overlay_9.png` image.
- **Interaction:** An invisible `button` element is absolute-positioned *exactly* over the red button area in the image.
- **Logic:**
  - **Tap 1:** Connects to LiveKit (Starts Chat).
  - **Tap 2:** Disconnects from LiveKit (Ends Chat).
  - **State:** Toggles `isChatActive`.

### 2. Seamless "Idle" to "Active" Transition
To avoid black screens or "Loading..." text during the connection phase:
1.  **Idle State:** An idle video (`squatch-idle.mp4`) plays in a loop on the bottom layer.
2.  **Connecting State:** The `SimliSquare` component is rendered but remains **transparent** (`return null`) until the video track is fully received.
3.  **Active State:** Once the LiveKit video track is ready, `SimliSquare` renders the video, effectively "fading in" over the idle video.
4.  **Disconnect:** `SimliSquare` unmounts, revealing the idle video underneath instantly.

### 3. iOS Specifics (CRITICAL)
For the app to work on iPhone (via Capacitor):
- **`playsInline={true}`**: MUST be added to the `VideoTrack` component in `SimliSquare.tsx`. Without this, the video will be a black screen on iOS.
- **`video={false}`**: In `LiveKitRoom`, set `video={false}` to ensure the **user's camera** (selfie mode) is NOT turned on. We only want to see the agent.

### 4. Audio & Autoplay
- **Background Audio:** `forest-ambience.wav` plays on loop.
- **Autoplay Handling:** Browsers (especially Safari/iOS) block autoplay. We handle this by attempting to play on mount, and if blocked, adding a one-time `click`/`touchstart` listener to start audio/video on the first user interaction.

## Environment Variables
Required in `.env.local` and Railway:
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`
- `SIMLI_API_KEY`
- `SIMLI_FACE_ID`