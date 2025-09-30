# App Store Submission Prep

This checklist captures everything SquatchChat needs before uploading the first build to App Store Connect.

## App Identity
- **Bundle ID**: `com.squatchchat.app` (already set in Xcode and capacitor.config)
- **Versioning**: marketing version `1.0`, build number auto-incremented by `build-appstore.sh`
- **Display name**: SquatchChat (Info.plist `CFBundleDisplayName`)
- **Categories**: Primary `Entertainment`, Secondary `Lifestyle`
- **Age rating**: 9+ (fantasy themes, no mature content)

## Marketing Copy
- **Subtitle**: `Chat with the forest's friendliest legend`
- **Promotional Text** (170 chars max): `Drop into the clearing and talk directly with Squatch. Ask questions, trade stories, and pick up practical outdoor tips whenever you need them.`
- **Description**:
  ```
  Step into the forest clearing and have a real conversation with Squatch. SquatchChat blends a lifelike avatar with live voice AI so you can ask questions, hear tall tales, and pick up useful outdoor tips in seconds.

  · Push-to-talk voice chat with a responsive Bigfoot guide
  · Lifelike 3D avatar rendered inside a cinematic forest scene
  · Ambient soundscape that reacts the moment the chat begins
  · Built-in knowledge base grounded in Pacific Northwest lore and Leave No Trace advice
  · Quick session controls so you can jump in, chat, and get back to your day

  Whether you are planning a hike, need a bedtime story, or just want to hang out with a friendly forest guardian, Squatch is ready.
  ```
- **Keywords**: `bigfoot,sasquatch,ai chat,voice assistant,storytelling,forest,live avatar,simli`
- **Support URL**: `https://squatchchat.com/support` *(replace with your live page)*
- **Marketing URL**: `https://squatchchat.com` *(replace with your live marketing site)*
- **Privacy Policy URL**: `https://squatchchat.com/privacy` *(must be live before review)*
- **Customer support email**: `support@squatchchat.com` *(update to monitored inbox)*

## Creative Assets
- **App Icon**: regenerate via `./generate-ios-icons.sh` (uses `AppIcon-512@2x.png` source)
- **App Store Icon**: 1024×1024 PNG already present at `Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
- **Screenshots** (minimum):
  - 6.7" (1290×2796) iPhone screenshot
  - 6.1" (1170×2532) iPhone screenshot
  - Optional 5.5" (1242×2208) iPhone screenshot
  Use the in-app overlay and idle animation for consistent framing. Capture with real device build running release mode so the avatar and HUD render correctly.
- **App Preview (optional)**: 15–30s clip showing push-to-talk and response.

## Privacy & Compliance
- **Camera usage**: Required for optional video calls; declared in Info.plist (`NSCameraUsageDescription`).
- **Microphone usage**: Required for push-to-talk; declared in Info.plist (`NSMicrophoneUsageDescription`).
- **Data collection**: No account sign-in. Voice streams route through Simli's infrastructure via short-lived session tokens. No analytics or tracking SDKs. Mark "Data Not Collected" in the privacy questionnaire, specify that audio/video are used in real time and not stored by the app. Document that transcripts may be processed by Simli/OpenAI for response generation.
- **Encryption**: Set "Uses non-exempt encryption" to No (Info.plist `ITSAppUsesNonExemptEncryption = false`).

## Build & Packaging
1. Install dependencies: `npm install` (if needed) and CocoaPods (`sudo gem install cocoapods`).
2. Regenerate icons (`./generate-ios-icons.sh`) after updating the master PNG.
3. Run `./build-appstore.sh`:
   - Cleans `out/` and `ios/App/App/public`
   - Runs `npm run build` and `npm run export`
   - Copies `capacitor.config.prod.json` over the dev config
   - Executes `npx cap sync ios`
   - Auto-increments `CURRENT_PROJECT_VERSION`
   - Opens `ios/App/App.xcworkspace`
4. In Xcode:
   - Select your Apple Developer Team, enable automatic signing.
   - Ensure the bundle ID matches the App ID created in Apple Developer.
   - Update the marketing version if shipping a new public release.
   - Product → Archive, then Distribute → App Store Connect → Upload.

## Test Checklist
- Launches successfully on iPhone hardware running iOS 17+ in release mode.
- Background video plays on load (or after user interaction if autoplay is blocked).
- Push-to-talk mic permission prompt appears and enables audio streaming.
- Avatar connects, speaks with ElevenLabs voice, and uses the Squatch knowledge base.
- Ambient audio starts and can be muted via the on-screen toggle.
- App returns to idle state cleanly when session ends.

## App Store Connect Tasks (requires Apple login)
- Create the App Store app record with the bundle ID and choose pricing (Free by default).
- Enter the marketing copy, URLs, and upload screenshots/App Store icon.
- Fill out the App Privacy questionnaire using the data collection notes above.
- Set up TestFlight internal testers to validate the uploaded build.
- Submit for review once metadata passes the automatic checks.

Keep this document updated after each release (new features, privacy changes, marketing copy tweaks) to speed up future submissions.
