'use client';

import { useState, useCallback } from 'react';
import type { PosterConfig, PosterLocation, PosterStyle, ColorPalette } from '@/types/poster';
import { getDefaultStyle } from '@/lib/styles';

// Default location: San Francisco
const defaultLocation: PosterLocation = {
  name: 'San Francisco',
  city: 'San Francisco, CA',
  subtitle: 'California, USA',
  center: [-122.4194, 37.7749],
  bounds: [
    [-122.5179, 37.7038], // SW corner
    [-122.3774, 37.8324], // NE corner
  ],
  zoom: 12,
};

const defaultStyle = getDefaultStyle();

const defaultConfig: PosterConfig = {
  location: defaultLocation,
  style: defaultStyle,
  palette: defaultStyle.defaultPalette,
  typography: {
    titleFont: defaultStyle.recommendedFonts[0] || 'Inter',
    titleSize: 5,
    titleWeight: 800,
    titleLetterSpacing: 0.08,
    titleAllCaps: true,
    subtitleFont: defaultStyle.recommendedFonts[0] || 'Inter',
    subtitleSize: 2.5,
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'gradient',
    backdropHeight: 35,
    backdropAlpha: 1.0,
    maxWidth: 80, // Default to 80% width
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 5,
    borderStyle: 'inset',
    texture: 'none',
    textureIntensity: 20,
  },
  layers: {
    streets: true,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    contours: false,
    population: false,
    labels: false,
    labelSize: 1, // Default scale (1.0x)
    labelMaxWidth: 10, // Default max width (ems/relative)
    marker: true,
  },
};

export function usePosterConfig() {
  const [config, setConfig] = useState<PosterConfig>(defaultConfig);

  const updateLocation = useCallback((location: Partial<PosterLocation>) => {
    setConfig(prev => ({ 
      ...prev, 
      location: { ...prev.location, ...location } 
    }));
  }, []);

  const updateStyle = useCallback((style: PosterStyle) => {
    setConfig(prev => ({
      ...prev,
      style,
      palette: style.defaultPalette, // Reset to default palette when style changes
      typography: {
        ...prev.typography,
        titleFont: style.recommendedFonts[0] || prev.typography.titleFont,
        subtitleFont: style.recommendedFonts[0] || prev.typography.subtitleFont,
      },
    }));
  }, []);

  const updatePalette = useCallback((palette: ColorPalette) => {
    setConfig(prev => ({ ...prev, palette }));
  }, []);

  const updateTypography = useCallback((typography: Partial<PosterConfig['typography']>) => {
    setConfig(prev => ({
      ...prev,
      typography: { ...prev.typography, ...typography },
    }));
  }, []);

  const updateFormat = useCallback((format: Partial<PosterConfig['format']>) => {
    setConfig(prev => ({
      ...prev,
      format: { ...prev.format, ...format },
    }));
  }, []);

  const updateLayers = useCallback((layers: Partial<PosterConfig['layers']>) => {
    setConfig(prev => ({
      ...prev,
      layers: { ...prev.layers, ...layers },
    }));
  }, []);

  return {
    config,
    updateLocation,
    updateStyle,
    updatePalette,
    updateTypography,
    updateFormat,
    updateLayers,
  };
}

