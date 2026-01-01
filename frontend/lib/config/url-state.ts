import LZString from 'lz-string';
import { PosterConfig, ColorPalette } from '@/types/poster';
import { getStyleById } from '@/lib/styles';
import { logger } from '@/lib/logger';

/**
 * Encodes a config object into a compressed URL-safe string.
 * We save IDs for Style and Palette to keep the URL short.
 * For AI-generated custom palettes, we include the full palette data.
 */
export function encodeConfig(config: PosterConfig): string {
  const isCustomPalette = config.palette.id === 'ai-custom';

  const compact: Record<string, any> = {
    l: config.location,
    s: config.style.id,
    p: config.palette.id,
    t: config.typography,
    f: config.format,
    ly: config.layers,
  };

  // Include full palette data for custom AI palettes
  if (isCustomPalette) {
    compact.cp = {
      background: config.palette.background,
      text: config.palette.text,
      water: config.palette.water,
      waterLine: config.palette.waterLine,
      greenSpace: config.palette.greenSpace,
      buildings: config.palette.buildings,
      landuse: config.palette.landuse,
      roads: config.palette.roads,
      accent: config.palette.accent,
      contour: config.palette.contour,
      hillshade: config.palette.hillshade,
    };
  }

  // Include camera settings if present
  if (config.camera) {
    compact.c = config.camera;
  }

  try {
    const json = JSON.stringify(compact);
    return LZString.compressToEncodedURIComponent(json);
  } catch (e) {
    logger.error('Failed to encode config', e);
    return '';
  }
}

/**
 * Decodes a compressed string back into a partial config.
 * Handles both standard palettes and custom AI-generated palettes.
 */
export function decodeConfig(encoded: string): Partial<PosterConfig> | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const data = JSON.parse(json);

    const style = getStyleById(data.s);
    if (!style) return null;

    // Handle custom AI palette
    let palette: ColorPalette;
    if (data.p === 'ai-custom' && data.cp) {
      palette = {
        id: 'ai-custom',
        name: 'AI Custom',
        style: 'minimal',
        border: data.cp.accent || data.cp.text,
        ...data.cp,
      };
    } else {
      // Find the palette by ID within the style
      palette = style.palettes.find(p => p.id === data.p) || style.defaultPalette;
    }

    const result: Partial<PosterConfig> = {
      location: data.l,
      style,
      palette,
      typography: data.t,
      format: data.f,
      layers: data.ly,
    };

    // Include camera settings if present
    if (data.c) {
      result.camera = data.c;
    }

    return result;
  } catch (e) {
    logger.error('Failed to decode config', e);
    return null;
  }
}

