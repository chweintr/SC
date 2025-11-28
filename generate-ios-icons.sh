#!/bin/bash

# Generate iOS App Icons from 1024x1024 source
# Requires ImageMagick: brew install imagemagick

SOURCE_ICON="ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
ICON_SET_PATH="ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

resize_with_tool() {
    local size="$1"
    local destination="$2"

    if command -v convert &> /dev/null; then
        convert "$SOURCE_ICON" -resize "${size}x${size}" "$destination"
    elif command -v sips &> /dev/null; then
        # sips preserves aspect ratio by default; force exact size
        sips -z "$size" "$size" "$SOURCE_ICON" --out "$destination" >/dev/null
    else
        echo "Error: Neither ImageMagick (convert) nor sips is available. Install ImageMagick with: brew install imagemagick"
        exit 1
    fi
}

echo "Generating iOS app icons..."

resize_with_tool 40  "$ICON_SET_PATH/AppIcon-20@2x.png"
resize_with_tool 60  "$ICON_SET_PATH/AppIcon-20@3x.png"

resize_with_tool 58  "$ICON_SET_PATH/AppIcon-29@2x.png"
resize_with_tool 87  "$ICON_SET_PATH/AppIcon-29@3x.png"

resize_with_tool 80  "$ICON_SET_PATH/AppIcon-40@2x.png"
resize_with_tool 120 "$ICON_SET_PATH/AppIcon-40@3x.png"

resize_with_tool 120 "$ICON_SET_PATH/AppIcon-60@2x.png"
resize_with_tool 180 "$ICON_SET_PATH/AppIcon-60@3x.png"

resize_with_tool 20  "$ICON_SET_PATH/AppIcon-20.png"
resize_with_tool 40  "$ICON_SET_PATH/AppIcon-20@2x-1.png"

resize_with_tool 29  "$ICON_SET_PATH/AppIcon-29.png"
resize_with_tool 58  "$ICON_SET_PATH/AppIcon-29@2x-1.png"

resize_with_tool 40  "$ICON_SET_PATH/AppIcon-40.png"
resize_with_tool 80  "$ICON_SET_PATH/AppIcon-40@2x-1.png"

resize_with_tool 76  "$ICON_SET_PATH/AppIcon-76.png"
resize_with_tool 152 "$ICON_SET_PATH/AppIcon-76@2x.png"

resize_with_tool 167 "$ICON_SET_PATH/AppIcon-83.5@2x.png"

echo "Icon generation complete!"

# Update Contents.json
cat > "$ICON_SET_PATH/Contents.json" << 'EOF'
{
  "images" : [
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "AppIcon-20@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "AppIcon-20@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "AppIcon-29@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "AppIcon-29@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "AppIcon-40@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "AppIcon-40@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "AppIcon-60@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "AppIcon-60@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "20x20",
      "idiom" : "ipad",
      "filename" : "AppIcon-20.png",
      "scale" : "1x"
    },
    {
      "size" : "20x20",
      "idiom" : "ipad",
      "filename" : "AppIcon-20@2x-1.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "ipad",
      "filename" : "AppIcon-29.png",
      "scale" : "1x"
    },
    {
      "size" : "29x29",
      "idiom" : "ipad",
      "filename" : "AppIcon-29@2x-1.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "ipad",
      "filename" : "AppIcon-40.png",
      "scale" : "1x"
    },
    {
      "size" : "40x40",
      "idiom" : "ipad",
      "filename" : "AppIcon-40@2x-1.png",
      "scale" : "2x"
    },
    {
      "size" : "76x76",
      "idiom" : "ipad",
      "filename" : "AppIcon-76.png",
      "scale" : "1x"
    },
    {
      "size" : "76x76",
      "idiom" : "ipad",
      "filename" : "AppIcon-76@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "83.5x83.5",
      "idiom" : "ipad",
      "filename" : "AppIcon-83.5@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "1024x1024",
      "idiom" : "ios-marketing",
      "filename" : "AppIcon-512@2x.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOF

echo "Contents.json updated!"
