import type { PosterConfig, PosterLocation } from '@/types/poster';
import { getDefaultStyle } from '@/lib/styles';

export const DEFAULT_LOCATION: PosterLocation = {
  name: 'Tokyo',
  city: 'Tokyo',
  subtitle: 'Japan',
  center: [139.6917, 35.6895],
  bounds: [
    [139.5700, 35.5500], // SW corner
    [139.9100, 35.8200], // NE corner
  ],
  zoom: 11,
};

const defaultStyle = getDefaultStyle();

export const DEFAULT_CONFIG: PosterConfig = {
  location: DEFAULT_LOCATION,
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
    backdropSharpness: 50,
    maxWidth: 80,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 5,
    borderStyle: 'inset',
    maskShape: 'rectangular',
    compassRose: false,
    texture: 'none',
    textureIntensity: 20,
  },
  layers: {
    streets: true,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    terrainUnderWater: true,
    hillshadeExaggeration: 0.5,
    contours: false,
    contourDensity: 50,
    population: false,
    pois: true, // Points of Interest (airports, monuments, etc.)
    labels: false,
    labelSize: 1,
    labelMaxWidth: 10,
    labelStyle: 'elevated',
    boundaries: false,
    marker: true,
    markerType: 'crosshair',
    markerColor: undefined, // Default to palette primary
    roadWeight: 1.0,
    buildings3D: false, // 3D extruded buildings
    buildings3DHeight: 1.0, // Height multiplier
  },
  camera: {
    pitch: 0, // Tilt angle 0-85 degrees
    bearing: 0, // Rotation -180 to 180 degrees
  },
};

