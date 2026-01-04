# Cartistry iOS App

Native iOS app for Cartistry - the Map Poster Generator. Built with Capacitor to wrap the Next.js web app in a native iOS shell.

## Prerequisites

- **Node.js** 18+ and npm
- **Xcode** 15+ (with Command Line Tools)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Apple Developer Account** (for device testing and App Store)

## Quick Start

### 1. Install Dependencies

```bash
# In ios-app directory
npm install

# In frontend directory (if not already done)
cd ../frontend && npm install
```

### 2. Initialize iOS Project

```bash
# First time only - creates the ios/ folder with Xcode project
npm run init
```

### 3. Build and Open in Xcode

```bash
# Build web assets and sync to iOS
npm run build

# Open in Xcode
npm run open
```

### 4. Run on Simulator/Device

In Xcode:
1. Select a simulator or connected device
2. Click the Play button (⌘R)

## Development Workflow

### Making Changes

1. **Web changes**: Edit files in `../frontend/`
2. **Rebuild**: Run `npm run build` in `ios-app/`
3. **Test**: Run in Xcode simulator

### Live Development (Optional)

For faster iteration during development, you can point to the Next.js dev server:

1. Edit `capacitor.config.ts`:
```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true,
}
```

2. Start the Next.js dev server:
```bash
cd ../frontend && npm run dev
```

3. Run the iOS app - it will load from localhost

> **Note**: Remember to remove/comment the `server.url` config before building for production!

## Project Structure

```
ios-app/
├── ios/                    # Xcode project (auto-generated)
│   └── App/
│       ├── App/            # Swift source files
│       ├── App.xcodeproj   # Xcode project
│       └── Podfile         # CocoaPods dependencies
├── www/                    # Built web assets (from frontend)
├── src/                    # Native bridge utilities
│   └── native-bridge.ts    # Capacitor plugin wrappers
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

### Using Native Features in Frontend

Import the platform hook:

```typescript
import { useNativePlatform } from '@/hooks/useNativePlatform';

function ExportButton() {
  const { isNative, share, hapticSuccess } = useNativePlatform();

  const handleExport = async () => {
    const dataUrl = await generatePoster();

    if (isNative) {
      await hapticSuccess();
      await share(dataUrl, 'My Map Poster');
    } else {
      // Web download fallback
      downloadImage(dataUrl);
    }
  };
}
```

## Building for App Store

### 1. Configure Signing

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the "App" target
3. Go to "Signing & Capabilities"
4. Select your Team and configure Bundle Identifier

### 2. Update App Info

Edit `ios/App/App/Info.plist`:
- `CFBundleDisplayName`: App name on home screen
- `CFBundleShortVersionString`: Version (e.g., "1.0.0")
- `CFBundleVersion`: Build number (e.g., "1")

### 3. Add App Icons

Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 4. Build Archive

1. In Xcode: Product → Archive
2. In Organizer: Distribute App → App Store Connect

## Customization

### App Icon

1. Create icon at 1024x1024px
2. Use a tool like [App Icon Generator](https://appicon.co/)
3. Replace files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Splash Screen

Edit in `ios/App/App/Assets.xcassets/Splash.imageset/` or configure in Xcode's LaunchScreen.storyboard

### Status Bar

Configured in `capacitor.config.ts`:
```typescript
plugins: {
  StatusBar: {
    style: 'dark', // or 'light'
    backgroundColor: '#000000',
  },
}
```

## Troubleshooting

### "No such module 'Capacitor'"
```bash
cd ios/App && pod install
```

### Build fails after updating plugins
```bash
npm run clean
npm run build
cd ios/App && pod install --repo-update
```

### White screen on launch
- Check that `www/` directory has content
- Verify `webDir` in `capacitor.config.ts` matches

### Map not loading
- Ensure network permissions in Info.plist
- Check for mixed content issues (HTTP vs HTTPS)

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build:web` | Build frontend and copy to www/ |
| `npm run sync` | Sync web assets to iOS project |
| `npm run build` | Full build (web + sync) |
| `npm run open` | Open Xcode project |
| `npm run dev` | Build and open Xcode |
| `npm run init` | Initialize iOS project (first time) |
| `npm run clean` | Remove build artifacts |

## License

MIT
