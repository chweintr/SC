# Current State (Nov 29, 2025)

## Status: App Store Prep & Polish

### ✅ Completed
- **iOS Black Screen Fix:** Added `playsInline` to `SimliSquare.tsx`.
- **Camera Privacy:** Disabled user camera (`video={false}`) in `SimliSquare.tsx`.
- **Unified Control:** Implemented "Red Button" toggle logic. Removed separate "Dismiss" button.
- **Seamless Transition:** Added `squatch-idle.mp4` background and transparency logic to `SimliSquare.tsx`.
- **Vertical Layout:** Restored full-screen vertical layout for mobile devices.

### 🚧 In Progress
- **App Store Submission:** User is verifying the latest build on TestFlight/Device.

### ⚠️ Known Constraints
- **Simli UI:** We strictly avoid the default Simli widget UI.
- **Orientation:** The app enforces `UIInterfaceOrientationPortrait` in `Info.plist` for iOS.
- **Audio:** Autoplay restrictions on iOS require the first user interaction (tap) to unmute/start audio.

## Next Steps
1.  Verify the latest deployment on the physical iOS device.
2.  Proceed with App Store screenshots and submission.
