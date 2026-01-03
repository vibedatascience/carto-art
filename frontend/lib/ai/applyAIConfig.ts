import type { PosterConfig, PosterLocation, ColorPalette } from '@/types/poster';
import { styles, getStyleById } from '@/lib/styles';
import { DEFAULT_CONFIG } from '@/lib/config/defaults';

/**
 * Custom palette structure from AI - full creative control
 */
export interface CustomPalette {
  background: string;
  text: string;
  water: string;
  waterLine?: string;
  greenSpace: string;
  buildings?: string;
  landuse?: string;
  roads: {
    motorway: string;
    trunk: string;
    primary: string;
    secondary: string;
    tertiary: string;
    residential: string;
    service: string;
  };
  accent?: string;
  contour?: string;
  hillshade?: string;
  population?: string;
}

/**
 * Partial config returned by AI - only includes fields that should change
 */
export interface AIGeneratedConfig {
  location?: {
    name?: string;
    city?: string;
    subtitle?: string;
    center?: [number, number];
    zoom?: number;
  };
  // Legacy style/palette selection
  styleId?: string;
  paletteId?: string;
  // New: Full custom palette control
  customPalette?: CustomPalette;
  typography?: Partial<PosterConfig['typography']>;
  format?: Partial<PosterConfig['format']>;
  layers?: Partial<PosterConfig['layers']>;
  // Camera settings for 3D view
  camera?: {
    pitch?: number; // 0-85 degrees
    bearing?: number; // -180 to 180 degrees
  };
  // Area highlight for emphasizing a region
  areaHighlight?: {
    coordinates: [number, number][];
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
  };
}

/**
 * Calculate bounds from center point and zoom level
 */
function calculateBounds(center: [number, number], zoom: number): [[number, number], [number, number]] {
  // Approximate degrees per pixel at equator at zoom 0
  const degreesPerPixel = 360 / 256;

  // Adjust for zoom level
  const scale = Math.pow(2, zoom);
  const degPerPixelAtZoom = degreesPerPixel / scale;

  // Assume a reasonable viewport size (roughly 800x600 pixels)
  const viewportWidth = 800;
  const viewportHeight = 600;

  const lngDelta = degPerPixelAtZoom * viewportWidth / 2;
  const latDelta = degPerPixelAtZoom * viewportHeight / 2;

  const [lng, lat] = center;

  return [
    [lng - lngDelta, lat - latDelta], // SW
    [lng + lngDelta, lat + latDelta], // NE
  ];
}

/**
 * Find a palette by ID within a style
 */
function findPalette(styleId: string, paletteId: string): ColorPalette | null {
  const style = getStyleById(styleId);
  if (!style) return null;

  // Try exact match first
  const exactMatch = style.palettes.find(p => p.id === paletteId);
  if (exactMatch) return exactMatch;

  // Try matching just the palette name part (after the style prefix)
  const paletteName = paletteId.replace(`${styleId}-`, '');
  const nameMatch = style.palettes.find(p =>
    p.id.endsWith(paletteName) ||
    p.name.toLowerCase().replace(/\s+/g, '-') === paletteName.toLowerCase()
  );
  if (nameMatch) return nameMatch;

  // Fallback to default palette for the style
  return style.defaultPalette;
}

/**
 * Convert a custom AI palette to a full ColorPalette object
 */
function customPaletteToColorPalette(custom: CustomPalette): ColorPalette {
  return {
    id: 'ai-custom',
    name: 'AI Custom',
    style: 'minimal', // Base style for rendering
    background: custom.background,
    text: custom.text,
    border: custom.accent || custom.text,
    roads: custom.roads,
    water: custom.water,
    waterLine: custom.waterLine || custom.water,
    greenSpace: custom.greenSpace,
    landuse: custom.landuse || custom.background,
    buildings: custom.buildings || custom.landuse || custom.background,
    accent: custom.accent || custom.text,
    contour: custom.contour,
    hillshade: custom.hillshade,
    population: custom.population,
  };
}

/**
 * Apply AI-generated partial config to create a full PosterConfig
 */
export function applyAIConfig(
  aiConfig: AIGeneratedConfig,
  baseConfig: PosterConfig = DEFAULT_CONFIG
): PosterConfig {
  let result = { ...baseConfig };

  // Apply style first (affects palette and fonts)
  if (aiConfig.styleId) {
    const newStyle = getStyleById(aiConfig.styleId);
    if (newStyle) {
      result.style = newStyle;
      result.palette = newStyle.defaultPalette;
      result.typography = {
        ...result.typography,
        titleFont: newStyle.recommendedFonts[0] || result.typography.titleFont,
        subtitleFont: newStyle.recommendedFonts[0] || result.typography.subtitleFont,
      };
    }
  }

  // Apply palette (legacy style-based)
  if (aiConfig.paletteId) {
    const palette = findPalette(result.style.id, aiConfig.paletteId);
    if (palette) {
      result.palette = palette;
    }
  }

  // Apply custom palette (NEW - full creative control)
  // This overrides any style/palette selection
  if (aiConfig.customPalette) {
    result.palette = customPaletteToColorPalette(aiConfig.customPalette);
  }

  // Apply location
  if (aiConfig.location) {
    const center = aiConfig.location.center || result.location.center;
    const zoom = aiConfig.location.zoom ?? result.location.zoom;

    result.location = {
      name: aiConfig.location.name ?? result.location.name,
      city: aiConfig.location.city ?? result.location.city,
      subtitle: aiConfig.location.subtitle ?? result.location.subtitle,
      center,
      zoom,
      bounds: calculateBounds(center, zoom),
    };
  }

  // Apply typography
  if (aiConfig.typography) {
    result.typography = {
      ...result.typography,
      ...aiConfig.typography,
    };
  }

  // Apply format
  if (aiConfig.format) {
    result.format = {
      ...result.format,
      ...aiConfig.format,
    };
  }

  // Apply layers
  if (aiConfig.layers) {
    result.layers = {
      ...result.layers,
      ...aiConfig.layers,
    };
  }

  // Apply camera settings (for 3D view)
  if (aiConfig.camera) {
    result.camera = {
      pitch: aiConfig.camera.pitch ?? result.camera?.pitch ?? 0,
      bearing: aiConfig.camera.bearing ?? result.camera?.bearing ?? 0,
    };
  }

  // Apply area highlight
  if (aiConfig.areaHighlight) {
    result.areaHighlight = {
      coordinates: aiConfig.areaHighlight.coordinates,
      fillColor: aiConfig.areaHighlight.fillColor,
      fillOpacity: aiConfig.areaHighlight.fillOpacity ?? 0.3,
      strokeColor: aiConfig.areaHighlight.strokeColor,
      strokeWidth: aiConfig.areaHighlight.strokeWidth ?? 2,
      strokeOpacity: aiConfig.areaHighlight.strokeOpacity ?? 0.8,
    };
  }

  return result;
}

/**
 * Get list of all available styles for display
 */
export function getAvailableStyles() {
  return styles.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    palettes: s.palettes.map(p => ({ id: p.id, name: p.name })),
  }));
}
