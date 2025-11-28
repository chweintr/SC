#!/bin/bash

echo "🏗️  Building SquatchChat for App Store..."

# Exit on error
set -e

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out
rm -rf ios/App/App/public

# 2. Build Next.js for production
echo "📦 Building Next.js app..."
npm run build

# 3. Prepare placeholder web assets (app points at remote prod server)
echo "📤 Preparing web asset placeholder..."
mkdir -p out
cat > out/index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SquatchChat</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #022c22; color: #ecfdf5; text-align: center; padding: 2rem; }
      h1 { font-size: 2rem; margin-bottom: 1rem; }
      p { max-width: 32rem; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>SquatchChat is loading&hellip;</h1>
      <p>The iOS app connects to the live SquatchChat service hosted at https://sc-production.up.railway.app. If you see this screen for more than a few seconds, check your connection and try again.</p>
    </main>
  </body>
</html>
HTML

# 4. Copy production capacitor config
echo "🔧 Using production configuration..."
cp capacitor.config.prod.json capacitor.config.json

# 5. Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
if [ -f "node_modules/.bin/cap" ]; then
  npx cap sync ios
else
  echo "⚠️  Capacitor CLI not installed locally. Copying web assets manually..."
  mkdir -p ios/App/App/public
  rsync -a out/ ios/App/App/public/
fi

# 6. Update build number (increment for each submission)
echo "📝 Updating build number..."
CURRENT_BUILD=$(grep -E "CURRENT_PROJECT_VERSION = [0-9]+" ios/App/App.xcodeproj/project.pbxproj | head -1 | grep -o "[0-9]\+")
NEW_BUILD=$((CURRENT_BUILD + 1))
sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT_BUILD;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" ios/App/App.xcodeproj/project.pbxproj
echo "   Build number updated from $CURRENT_BUILD to $NEW_BUILD"

# 7. Generate icons if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "🎨 Generating app icons..."
    ./generate-ios-icons.sh
else
    echo "⚠️  ImageMagick not installed. Skipping icon generation."
    echo "   Install with: brew install imagemagick"
fi

# 8. Open Xcode
echo "🚀 Opening Xcode..."
echo ""
echo "📋 NEXT STEPS IN XCODE:"
echo "   1. Select your Apple Developer Team in Signing & Capabilities"
echo "   2. Ensure 'Automatically manage signing' is checked"
echo "   3. Select 'Any iOS Device' as build target"
echo "   4. Product > Archive"
echo "   5. Once archived, click 'Distribute App'"
echo "   6. Follow App Store Connect submission flow"
echo ""
echo "⚠️  BEFORE SUBMITTING:"
echo "   - Ensure all app icons are present (run ./generate-ios-icons.sh)"
echo "   - Test on a real device"
echo "   - Prepare App Store screenshots"
echo "   - Write app description and keywords"
echo "   - Set up App Store Connect metadata"
echo ""

open ios/App/App.xcworkspace
