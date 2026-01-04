import type { CapacitorConfig } from '@capacitor/cli';

// Set to your production URL, or use localhost for development
const PRODUCTION_URL = 'https://cartistry.app'; // Update this to your deployed URL
const DEV_URL = 'http://localhost:3000';
const USE_PRODUCTION = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.cartistry.app',
  appName: 'Cartistry',
  webDir: 'www',
  server: {
    // For MVP: Load from deployed website (includes all API routes)
    // This avoids the static export limitation with API routes
    url: USE_PRODUCTION ? PRODUCTION_URL : DEV_URL,
    cleartext: !USE_PRODUCTION, // Allow HTTP for localhost dev

    // Production settings
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsLinkPreview: false,
    backgroundColor: '#000000',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    Haptics: {
      // Default haptic settings
    },
  },
};

export default config;
