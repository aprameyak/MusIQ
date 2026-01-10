# Icon Setup Instructions

To use your app icon for the web app:

1. Export your app icon from Xcode:
   - Open `frontend/MusicApp.xcodeproj` in Xcode
   - Go to Assets.xcassets → AppIcon
   - Export the 1024x1024 or 512x512 version

2. Save it as `webapp/public/icon.png` (512x512 PNG recommended)

3. The icon will be used for:
   - Browser favicon
   - iOS home screen icon
   - Web app manifest

Alternatively, you can create a simple icon with:
- Background: #35516D (primary color)
- Music note icon in white
- 512x512 pixels

