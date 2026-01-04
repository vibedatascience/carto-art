'use client';

import { useEffect, useState, useCallback } from 'react';

interface NativePlatform {
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isCapacitor: boolean;
}

interface NativeActions {
  share: (dataUrl: string, title: string) => Promise<void>;
  hapticLight: () => Promise<void>;
  hapticMedium: () => Promise<void>;
  hapticSuccess: () => Promise<void>;
  hapticError: () => Promise<void>;
  saveImage: (dataUrl: string, fileName: string) => Promise<string>;
}

/**
 * Hook for detecting native platform and accessing native features
 * Works with Capacitor when running in iOS app, falls back to web APIs otherwise
 */
export function useNativePlatform(): NativePlatform & NativeActions {
  const [platform, setPlatform] = useState<NativePlatform>({
    isNative: false,
    isIOS: false,
    isAndroid: false,
    isWeb: true,
    isCapacitor: false,
  });

  useEffect(() => {
    // Check if Capacitor is available
    const checkPlatform = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { Capacitor } = await import('@capacitor/core');

        const isNative = Capacitor.isNativePlatform();
        const platformName = Capacitor.getPlatform();

        setPlatform({
          isNative,
          isIOS: platformName === 'ios',
          isAndroid: platformName === 'android',
          isWeb: platformName === 'web',
          isCapacitor: true,
        });
      } catch {
        // Capacitor not available, running as pure web app
        setPlatform({
          isNative: false,
          isIOS: false,
          isAndroid: false,
          isWeb: true,
          isCapacitor: false,
        });
      }
    };

    checkPlatform();
  }, []);

  // Share using native share sheet or web download
  const share = useCallback(async (dataUrl: string, title: string) => {
    if (platform.isNative) {
      try {
        const { Share } = await import('@capacitor/share');
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Haptics, NotificationType } = await import('@capacitor/haptics');

        // Save to temp file
        const base64Data = dataUrl.split(',')[1];
        const fileName = `cartistry-${Date.now()}.png`;

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        // Share
        await Share.share({
          title: title,
          text: `Check out my map poster: ${title}`,
          url: savedFile.uri,
          dialogTitle: 'Share your map poster',
        });

        await Haptics.notification({ type: NotificationType.Success });
      } catch (error) {
        console.error('Native share failed:', error);
        // Fallback to download
        downloadImage(dataUrl, title);
      }
    } else {
      downloadImage(dataUrl, title);
    }
  }, [platform.isNative]);

  // Save image to device
  const saveImage = useCallback(async (dataUrl: string, fileName: string): Promise<string> => {
    if (platform.isNative) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Haptics, NotificationType } = await import('@capacitor/haptics');

        const base64Data = dataUrl.split(',')[1];
        const fullFileName = `${fileName}-${Date.now()}.png`;

        const result = await Filesystem.writeFile({
          path: fullFileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        await Haptics.notification({ type: NotificationType.Success });
        return result.uri;
      } catch (error) {
        console.error('Native save failed:', error);
        downloadImage(dataUrl, fileName);
        return fileName;
      }
    } else {
      downloadImage(dataUrl, fileName);
      return fileName;
    }
  }, [platform.isNative]);

  // Haptic feedback functions
  const hapticLight = useCallback(async () => {
    if (!platform.isNative) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  }, [platform.isNative]);

  const hapticMedium = useCallback(async () => {
    if (!platform.isNative) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}
  }, [platform.isNative]);

  const hapticSuccess = useCallback(async () => {
    if (!platform.isNative) return;
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Success });
    } catch {}
  }, [platform.isNative]);

  const hapticError = useCallback(async () => {
    if (!platform.isNative) return;
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Error });
    } catch {}
  }, [platform.isNative]);

  return {
    ...platform,
    share,
    saveImage,
    hapticLight,
    hapticMedium,
    hapticSuccess,
    hapticError,
  };
}

// Helper function for web download fallback
function downloadImage(dataUrl: string, title: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
