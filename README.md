# SquatchChat

A "Squatch Communicator" web and mobile app that lets users talk to a Sasquatch AI avatar.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Avatar:** Simli (via LiveKit)
- **Mobile:** Capacitor (iOS)
- **Styling:** Tailwind CSS
- **Deployment:** Railway (Web) + App Store (iOS)

## Key Features
- **Immersive UI:** Designed to look like a physical device with a static overlay.
- **Responsive:** Full-screen vertical on mobile, 16:9 "device" on desktop.
- **Seamless AI:** Uses LiveKit for low-latency video streaming of the Simli avatar.
- **Push-to-Talk / Toggle:** Custom "Red Button" interaction to start/stop the session.

## Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env.local` file with:
    ```
    LIVEKIT_API_KEY=...
    LIVEKIT_API_SECRET=...
    LIVEKIT_URL=...
    SIMLI_API_KEY=...
    SIMLI_FACE_ID=...
    ```

3.  **Run the dev server:**
    ```bash
    npm run dev
    ```

4.  **Build for iOS (Capacitor):**
    ```bash
    npm run build
    npx cap sync ios
    npx cap open ios
    ```

## Deployment
- **Web:** Deploys automatically to Railway on push to `main`.
- **iOS:** Build locally using Xcode and submit to App Store Connect.
