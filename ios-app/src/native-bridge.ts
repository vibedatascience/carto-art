/**
 * Native Bridge - Utilities for iOS native features via Capacitor
 *
 * This module provides a bridge between the web app and iOS native capabilities.
 * Import these utilities in the frontend when running in the Capacitor context.
 */

import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { App } from '@capacitor/app';

/**
 * Check if running in native iOS context
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running specifically on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Share an image using the native share sheet
 * @param imageDataUrl - Base64 data URL of the image
 * @param title - Title for the share
 */
export const shareImage = async (
  imageDataUrl: string,
  title: string = 'My Map Poster'
): Promise<void> => {
  if (!isNative()) {
    // Fallback for web - download the image
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
    return;
  }

  try {
    // Save to temp file first
    const base64Data = imageDataUrl.split(',')[1];
    const fileName = `cartistry-${Date.now()}.png`;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    // Share the file
    await Share.share({
      title: title,
      text: `Check out my map poster: ${title}`,
      url: savedFile.uri,
      dialogTitle: 'Share your map poster',
    });

    // Haptic feedback on success
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    console.error('Error sharing image:', error);
    await Haptics.notification({ type: NotificationType.Error });
    throw error;
  }
};

/**
 * Save image to device photo library
 * @param imageDataUrl - Base64 data URL of the image
 * @param fileName - Name for the saved file
 */
export const saveImageToDevice = async (
  imageDataUrl: string,
  fileName: string = 'cartistry-poster'
): Promise<string> => {
  if (!isNative()) {
    // Web fallback - trigger download
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `${fileName}.png`;
    link.click();
    return fileName;
  }

  const base64Data = imageDataUrl.split(',')[1];
  const fullFileName = `${fileName}-${Date.now()}.png`;

  const result = await Filesystem.writeFile({
    path: fullFileName,
    data: base64Data,
    directory: Directory.Documents,
  });

  await Haptics.notification({ type: NotificationType.Success });
  return result.uri;
};

/**
 * Trigger haptic feedback
 */
export const haptic = {
  light: () => Haptics.impact({ style: ImpactStyle.Light }),
  medium: () => Haptics.impact({ style: ImpactStyle.Medium }),
  heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }),
  success: () => Haptics.notification({ type: NotificationType.Success }),
  warning: () => Haptics.notification({ type: NotificationType.Warning }),
  error: () => Haptics.notification({ type: NotificationType.Error }),
};

/**
 * Configure status bar appearance
 */
export const configureStatusBar = async (dark: boolean = true): Promise<void> => {
  if (!isNative()) return;

  await StatusBar.setStyle({
    style: dark ? Style.Dark : Style.Light,
  });
};

/**
 * Hide splash screen (call when app is ready)
 */
export const hideSplashScreen = async (): Promise<void> => {
  if (!isNative()) return;

  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide();
};

/**
 * Handle app URL open (for deep linking)
 */
export const setupDeepLinking = (
  onUrl: (url: string) => void
): (() => void) => {
  if (!isNative()) return () => {};

  const listener = App.addListener('appUrlOpen', (event) => {
    onUrl(event.url);
  });

  return () => {
    listener.remove();
  };
};

/**
 * Handle app state changes
 */
export const setupAppStateListener = (
  onStateChange: (isActive: boolean) => void
): (() => void) => {
  if (!isNative()) return () => {};

  const listener = App.addListener('appStateChange', (state) => {
    onStateChange(state.isActive);
  });

  return () => {
    listener.remove();
  };
};

/**
 * Get app info
 */
export const getAppInfo = async () => {
  if (!isNative()) {
    return {
      name: 'Cartistry',
      version: '1.0.0',
      build: 'web',
    };
  }

  const info = await App.getInfo();
  return {
    name: info.name,
    version: info.version,
    build: info.build,
  };
};
