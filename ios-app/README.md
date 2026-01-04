# Cartistry iOS App

Native iOS app for Cartistry - the Map Poster Generator. Built with Capacitor to wrap the web app in a native iOS shell with access to native features.

## Architecture

This iOS app uses a **WebView approach** - it loads your deployed Cartistry website inside a native iOS container. This provides:

- **Full functionality** - All features work including AI generation, geocoding, auth
- **Native enhancements** - Share sheet, haptic feedback, status bar control
- **Easy updates** - Deploy web changes without App Store review
- **Minimal maintenance** - One codebase for web and iOS

## Prerequisites

- **Node.js** 18+ and npm
- **Xcode** 15+ (from Mac App Store)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Apple Developer Account** (for device testing and App Store)

## Quick Start

### 1. Install Dependencies

```bash
cd ios-app
npm install
```

### 2. Configure Your URL

Edit `capacitor.config.ts` and set your production URL:

```typescript
const PRODUCTION_URL = 'https://your-domain.com'; // Your deployed site
```

### 3. Initialize iOS Project

```bash
npm run init   # Creates ios/ folder with Xcode project
npm run sync   # Syncs configuration to Xcode
```

### 4. Open in Xcode

```bash
npm run open
```

### 5. Run the App

In Xcode:
1. Select an iPhone simulator (or connected device)
2. Click the Play button (⌘R)

## Development

### Testing with Local Dev Server

1. Start your Next.js dev server:
```bash
cd ../frontend && npm run dev
```

2. The app will load from `http://localhost:3000` by default in development mode.

### Testing with Production

Set `NODE_ENV=production` before syncing:
```bash
NODE_ENV=production npm run sync
```

## Project Structure

```
ios-app/
├── ios/                    # Xcode project (auto-generated)
│   └── App/
│       ├── App/            # Swift source files
│       ├── App.xcodeproj   # Xcode project
│       └── Podfile         # CocoaPods dependencies
├── www/                    # Placeholder (app loads from URL)
├── src/                    # Native bridge utilities
├── capacitor.config.ts     # Capacitor configuration
└── package.json
```

## Native Features

The app includes these Capacitor plugins:

| Plugin | Purpose |
|--------|---------|
| `@capacitor/app` | App lifecycle, deep links |
| `@capacitor/share` | Native share sheet for exports |
| `@capacitor/haptics` | Haptic feedback on actions |
| `@capacitor/status-bar` | Status bar styling |
| `@capacitor/splash-screen` | Launch screen |
| `@capacitor/filesystem` | Save exports to device |
| `@capacitor/keyboard` | Keyboard handling |

### Using in Frontend Code

The frontend automatically detects when running in the iOS app:

```typescript
import { useNativePlatform } from '@/hooks/useNativePlatform';

function MyComponent() {
  const { isNative, share, hapticSuccess } = useNativePlatform();

  const handleShare = async () => {
    if (isNative) {
      await hapticSuccess();
      await share(imageDataUrl, 'My Map');
    }
  };
}
```

## Building for App Store

### 1. Configure Signing

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the "App" target
3. Go to "Signing & Capabilities"
4. Select your Team and Bundle Identifier

### 2. Update App Info

Edit `ios/App/App/Info.plist`:
- `CFBundleDisplayName`: "Cartistry"
- `CFBundleShortVersionString`: "1.0.0"
- `CFBundleVersion`: "1"

### 3. Add App Icons

Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Use [App Icon Generator](https://appicon.co/) to create all sizes from a 1024x1024 source.

### 4. Build Archive

1. In Xcode: Product → Archive
2. In Organizer: Distribute App → App Store Connect

## Troubleshooting

### "No such module 'Capacitor'"
```bash
cd ios/App && pod install
```

### White screen on launch
- Check that your server URL is accessible
- Verify no network/CORS issues in Safari developer tools

### App rejected for "web wrapper"
Apple may reject apps that are purely web wrappers. To avoid rejection:
- Emphasize native features (share sheet, haptics)
- Ensure offline functionality where possible
- Add unique iOS-specific features

## Scripts

| Script | Description |
|--------|-------------|
| `npm run init` | Initialize iOS project (first time) |
| `npm run sync` | Sync config to Xcode |
| `npm run open` | Open Xcode project |
| `npm run dev` | Sync and open Xcode |
| `npm run clean` | Remove CocoaPods cache |

## License

MIT
