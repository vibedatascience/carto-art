import type { ColorPalette, PosterConfig, PosterStyle } from '@/types/poster';
import { isColorDark } from '@/lib/utils';

/**
 * Applies a color palette and layer visibility to a MapLibre style
 */
export function applyPaletteToStyle(
  style: any, 
  palette: ColorPalette, 
  layers?: PosterConfig['layers'],
  layerToggles?: PosterStyle['layerToggles']
): any {
  // Use a faster/cleaner deep clone if possible, but JSON is safe for Mapbox styles
  const updatedStyle = JSON.parse(JSON.stringify(style));

  if (!updatedStyle.layers) return updatedStyle;

  handleContourSource(updatedStyle);
  
  if (layers && layerToggles) {
    applyVisibilityToggles(updatedStyle.layers, layers, layerToggles);
  }

  const labelAdjustment = layers?.labels ? 0.85 : 1.0;

  updatedStyle.layers.forEach((layer: any) => {
    updateLayerPaint(layer, palette, layers, labelAdjustment);
    updateLayerLayout(layer, layers);
  });

  return updatedStyle;
}

function handleContourSource(style: any) {
  const contourSource = style.sources?.contours;
  if (!contourSource || !contourSource.url || contourSource.url === '') {
    style.layers = style.layers.filter((layer: any) => 
      layer.id !== 'contours' && !layer.id.includes('contour')
    );
  }
}

function applyVisibilityToggles(
  styleLayers: any[], 
  configLayers: PosterConfig['layers'], 
  layerToggles: PosterStyle['layerToggles']
) {
  styleLayers.forEach((layer) => {
    const toggle = layerToggles.find(t => t.layerIds.includes(layer.id));
    if (toggle) {
      const isVisible = configLayers[toggle.id as keyof PosterConfig['layers']];
      layer.layout = {
        ...layer.layout,
        visibility: isVisible ? 'visible' : 'none'
      };
    }
  });
}

function updateLayerPaint(layer: any, palette: ColorPalette, layers: PosterConfig['layers'] | undefined, labelAdjustment: number) {
  const { id, type } = layer;

  // Background
  if (id === 'background' && type === 'background') {
    layer.paint = { 'background-color': palette.background };
    return;
  }

  // Hillshade
  if (id === 'hillshade' && type === 'hillshade') {
    const isDark = isColorDark(palette.background);
    layer.paint = {
      ...layer.paint,
      'hillshade-shadow-color': isDark ? '#000000' : palette.secondary,
      'hillshade-highlight-color': isDark ? palette.secondary : palette.background,
      'hillshade-accent-color': isDark ? '#000000' : palette.secondary,
    };
    return;
  }

  // Water
  if (id === 'water' && type === 'fill') {
    layer.paint = { ...layer.paint, 'fill-color': palette.water };
    return;
  }

  // Parks
  if (id === 'park' && type === 'fill') {
    layer.paint = { ...layer.paint, 'fill-color': palette.parks || palette.greenSpace };
    return;
  }

  // Contours
  if (id.includes('contour') || id.includes('topo')) {
    if (type === 'line' && palette.contour) {
      layer.paint = {
        ...layer.paint,
        'line-color': palette.contour,
        'line-opacity': layer.paint?.['line-opacity'] ?? 0.4,
      };
    }
    applyContourDensity(layer, layers?.contourDensity);
    return;
  }

  // Population
  if (id.includes('population') && type === 'fill' && palette.population) {
    const existingOpacity = layer.paint?.['fill-opacity'];
    layer.paint = {
      ...layer.paint,
      'fill-color': palette.population,
      'fill-opacity': Array.isArray(existingOpacity) ? existingOpacity : (existingOpacity ?? 0.6),
    };
    return;
  }

  // Roads
  if (id.startsWith('road-')) {
    updateRoadLayer(layer, palette, labelAdjustment);
    return;
  }

  // Buildings
  if (id.includes('building')) {
    if (type === 'fill') {
      layer.paint = {
        ...layer.paint,
        'fill-color': palette.buildings || palette.primary,
        'fill-opacity': layer.paint?.['fill-opacity'] ?? 0.5,
      };
    } else if (type === 'line') {
      layer.paint = {
        ...layer.paint,
        'line-color': palette.buildings || palette.primary,
      };
    }
    return;
  }

  // Labels
  if (id.includes('label') && type === 'symbol') {
    layer.paint = {
      ...layer.paint,
      'text-color': palette.text,
      'text-halo-color': palette.background,
      'text-halo-width': 1.5,
      'text-halo-blur': 0.5,
    };
    return;
  }

  // Grid
  if (id === 'grid' && palette.grid) {
    layer.paint = {
      ...layer.paint,
      'line-color': palette.grid,
      'line-opacity': layer.paint?.['line-opacity'] ?? 0.2,
    };
  }
}

function applyContourDensity(layer: any, density: number | undefined) {
  if (!density || layer['source-layer'] !== 'contour') return;

  if (layer.id.includes('index')) {
    layer.filter = ['==', ['%', ['get', 'ele'], density * 5], 0];
  } else if (layer.id.includes('regular')) {
    layer.filter = [
      'all',
      ['==', ['%', ['get', 'ele'], density], 0],
      ['!=', ['%', ['get', 'ele'], density * 5], 0]
    ];
  } else {
    layer.filter = ['==', ['%', ['get', 'ele'], density], 0];
  }
}

function updateRoadLayer(layer: any, palette: ColorPalette, labelAdjustment: number) {
  if (layer.type !== 'line') return;

  if (palette.roads) {
    const roadType = layer.id.split('-')[1];
    const roadColor = (palette.roads as any)[roadType];
    if (roadColor) {
      layer.paint['line-color'] = roadColor;
      layer.paint['line-opacity'] = (layer.paint?.['line-opacity'] ?? 1.0) * labelAdjustment;
      return;
    }
  }

  // Fallback
  const isSecondary = ['road-street', 'road-residential', 'road-tertiary', 'road-service'].includes(layer.id);
  layer.paint = {
    ...layer.paint,
    'line-color': isSecondary ? palette.secondary : palette.primary,
    'line-opacity': (layer.paint?.['line-opacity'] ?? (isSecondary ? 0.8 : 1.0)) * labelAdjustment,
  };
}

function updateLayerLayout(layer: any, layers: PosterConfig['layers'] | undefined) {
  if (layer.type === 'symbol' && layers?.labelMaxWidth) {
    layer.layout = {
      ...layer.layout,
      'text-max-width': layers.labelMaxWidth,
    };
  }
}
