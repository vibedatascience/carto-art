'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type MapLibreGL from 'maplibre-gl';
import type { PosterConfig } from '@/types/poster';
import { exportMapToPNG, downloadBlob } from '@/lib/export/exportCanvas';
import { logger } from '@/lib/logger';
import type { ExportResolution } from '@/lib/export/constants';

// Native platform detection and sharing
let isNativePlatform = false;
let shareNative: ((dataUrl: string, title: string) => Promise<void>) | null = null;
let hapticSuccess: (() => Promise<void>) | null = null;

// Initialize native capabilities (runs once on module load)
if (typeof window !== 'undefined') {
  import('@capacitor/core').then(({ Capacitor }) => {
    isNativePlatform = Capacitor.isNativePlatform();
    if (isNativePlatform) {
      // Load native sharing capabilities
      Promise.all([
        import('@capacitor/share'),
        import('@capacitor/filesystem'),
        import('@capacitor/haptics'),
      ]).then(([{ Share }, { Filesystem, Directory }, { Haptics, NotificationType }]) => {
        shareNative = async (dataUrl: string, title: string) => {
          const base64Data = dataUrl.split(',')[1];
          const fileName = `cartistry-${Date.now()}.png`;
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });
          await Share.share({
            title: title,
            text: `Check out my map poster: ${title}`,
            url: savedFile.uri,
            dialogTitle: 'Share your map poster',
          });
        };
        hapticSuccess = async () => {
          await Haptics.notification({ type: NotificationType.Success });
        };
      }).catch(() => {
        // Native plugins not available
      });
    }
  }).catch(() => {
    // Capacitor not available (running as pure web app)
  });
}

/**
 * Hook for exporting the map as a high-resolution PNG image.
 * Handles map reference management and export state.
 * 
 * @param config - Current poster configuration for export settings
 * @returns Object containing:
 * - isExporting: Whether an export is currently in progress
 * - exportToPNG: Function to trigger PNG export
 * - setMapRef: Set the MapLibre map instance reference
 * - fitToLocation: Fit map to original location bounds
 * - zoomIn: Zoom in on the map
 * - zoomOut: Zoom out on the map
 * 
 * @example
 * ```tsx
 * const { isExporting, exportToPNG, setMapRef } = useMapExport(config);
 * <MapPreview onMapLoad={setMapRef} />
 * <button onClick={exportToPNG} disabled={isExporting}>Export</button>
 * ```
 */
export function useMapExport(config: PosterConfig) {
  const [isExporting, setIsExporting] = useState(false);
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  const setMapRef = (map: MapLibreGL.Map | null) => {
    mapRef.current = map;
  };

  const exportToPNG = async (options?: { filename?: string; resolution?: ExportResolution } | string | React.MouseEvent) => {
    if (!mapRef.current) {
      throw new Error('Map instance not available');
    }

    // Handle different call signatures for backwards compatibility
    let filename: string | undefined;
    let resolution: ExportResolution | undefined;

    if (typeof options === 'string') {
      filename = options;
    } else if (options && typeof options === 'object' && 'filename' in options) {
      filename = options.filename;
      resolution = options.resolution;
    }

    setIsExporting(true);
    try {
      const blob = await exportMapToPNG({
        map: mapRef.current,
        config,
        resolution,
      });

      const exportFilename = filename || `${(config.location.name || 'poster').toString().replace(/[^a-z0-9]/gi, '-').toLowerCase()}-poster.png`;

      // Use native share on iOS, otherwise download
      if (isNativePlatform && shareNative) {
        // Convert blob to data URL for native sharing
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        await shareNative(dataUrl, config.location.name || 'Map Poster');
        if (hapticSuccess) await hapticSuccess();
      } else {
        downloadBlob(blob, exportFilename);
      }
    } catch (error) {
      logger.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const fitToLocation = () => {
    if (!mapRef.current) return;
    const { bounds } = config.location;
    mapRef.current.fitBounds(bounds as [[number, number], [number, number]], {
      padding: 40,
      duration: 1000,
    });
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn({ duration: 300 });
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut({ duration: 300 });
  };

  return {
    isExporting,
    exportToPNG,
    setMapRef,
    fitToLocation,
    zoomIn,
    zoomOut,
  };
}

