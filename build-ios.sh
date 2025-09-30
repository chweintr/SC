#!/bin/bash

echo "Building iOS app for SquatchChat..."

# Navigate to iOS directory
cd ios/App

# Install pods (if cocoapods is installed)
if command -v pod &> /dev/null; then
    echo "Installing CocoaPods dependencies..."
    pod install
else
    echo "Warning: CocoaPods not installed. Skipping pod install."
fi

# Build the app using xcodebuild
echo "Building iOS app..."
xcodebuild -project App.xcodeproj \
    -scheme App \
    -configuration Release \
    -sdk iphoneos \
    -derivedDataPath build \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO

echo "Build complete! Check ios/App/build for output."