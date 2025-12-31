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
  const updatedStyle = JSON.parse(JSON.stringify(style)); // Deep clone

  // Remove contour layers if the source is missing or has no URL
  // This prevents MapLibre from crashing if the API key is missing
  const contourSource = updatedStyle.sources?.contours;
  if (!contourSource || !contourSource.url || contourSource.url === '') {
    updatedStyle.layers = updatedStyle.layers.filter((layer: any) => 
      layer.id !== 'contours' && !layer.id.includes('contour')
    );
  }

  // Apply visibility toggles if provided
  if (layers && layerToggles) {
    updatedStyle.layers = updatedStyle.layers.map((layer: any) => {
      // Find if this layer belongs to any toggle group
      const toggle = layerToggles.find(t => t.layerIds.includes(layer.id));
      
      if (toggle) {
        const isVisible = layers[toggle.id as keyof PosterConfig['layers']];
        return {
          ...layer,
          layout: {
            ...layer.layout,
            visibility: isVisible ? 'visible' : 'none'
          }
        };
      }
      return layer;
    });
  }

  // Update background layer
  const backgroundLayer = updatedStyle.layers.find((layer: any) => layer.id === 'background');
  if (backgroundLayer && backgroundLayer.type === 'background') {
    backgroundLayer.paint = {
      'background-color': palette.background,
    };
  }

  // Update hillshade layer
  const hillshadeLayer = updatedStyle.layers.find((layer: any) => layer.id === 'hillshade');
  if (hillshadeLayer && hillshadeLayer.type === 'hillshade') {
    const isDark = isColorDark(palette.background);
    hillshadeLayer.paint = {
      ...hillshadeLayer.paint,
      'hillshade-shadow-color': isDark ? '#000000' : palette.secondary,
      'hillshade-highlight-color': isDark ? palette.secondary : palette.background,
      'hillshade-accent-color': isDark ? '#000000' : palette.secondary,
    };
  }

  // Update water layer
  const waterLayer = updatedStyle.layers.find((layer: any) => layer.id === 'water');
  if (waterLayer && waterLayer.type === 'fill') {
    waterLayer.paint = {
      ...waterLayer.paint,
      'fill-color': palette.water,
    };
  }

  // Update park layer
  const parkLayer = updatedStyle.layers.find((layer: any) => layer.id === 'park');
  if (parkLayer && parkLayer.type === 'fill') {
    parkLayer.paint = {
      ...parkLayer.paint,
      'fill-color': palette.greenSpace,
    };
  }

  // Update contour layers
  const contourLayers = updatedStyle.layers.filter((layer: any) =>
    layer.id && (layer.id.includes('contour') || layer.id.includes('topo'))
  );
  contourLayers.forEach((layer: any) => {
    if (layer.type === 'line' && palette.contour) {
      layer.paint = {
        ...layer.paint,
        'line-color': palette.contour,
        'line-opacity': layer.paint?.['line-opacity'] ?? 0.4,
      };
    }
  });

  // Update population layers
  const populationLayers = updatedStyle.layers.filter((layer: any) =>
    layer.id && layer.id.includes('population')
  );
  populationLayers.forEach((layer: any) => {
    if (layer.type === 'fill' && palette.population) {
      // Preserve existing paint properties if they are complex (arrays/expressions)
      const existingOpacity = layer.paint?.['fill-opacity'];
      
      layer.paint = {
        ...layer.paint,
        'fill-color': palette.population,
        // Only set a default if it's not already an interpolation/expression
        'fill-opacity': Array.isArray(existingOpacity) ? existingOpacity : (existingOpacity ?? 0.6),
      };
    }
  });

  // Update road layers
  const roadLayers = updatedStyle.layers.filter((layer: any) =>
    layer.id && layer.id.startsWith('road-')
  );

  const labelAdjustment = layers?.labels ? 0.85 : 1.0;

  roadLayers.forEach((layer: any) => {
    if (layer.type === 'line') {
      if (layer.id === 'road-street' || layer.id === 'road-service') {
        layer.paint = {
          ...layer.paint,
          'line-color': palette.secondary,
          'line-opacity': (layer.paint?.['line-opacity'] ?? 0.8) * labelAdjustment,
        };
      } else {
        layer.paint = {
          ...layer.paint,
          'line-color': palette.primary,
          'line-opacity': (layer.paint?.['line-opacity'] ?? 1.0) * labelAdjustment,
        };
      }
    }
  });

  // Update building layers
  const buildingLayers = updatedStyle.layers.filter((layer: any) =>
    layer.id && layer.id.includes('building')
  );
  buildingLayers.forEach((layer: any) => {
    if (layer.type === 'fill') {
      layer.paint = {
        ...layer.paint,
        'fill-color': palette.primary,
        'fill-opacity': layer.paint?.['fill-opacity'] ?? 0.5,
      };
    } else if (layer.type === 'line') {
      layer.paint = {
        ...layer.paint,
        'line-color': palette.primary,
      };
    }
  });

  // Update label layers
  const labelLayers = updatedStyle.layers.filter((layer: any) =>
    layer.id && layer.id.includes('label')
  );
  labelLayers.forEach((layer: any) => {
    if (layer.type === 'symbol') {
      layer.paint = {
        ...layer.paint,
        'text-color': palette.text,
        'text-halo-color': palette.background,
        'text-halo-width': 1.5,
        'text-halo-blur': 0.5,
      };

      // Apply label max width if provided
      if (layers?.labelMaxWidth) {
        layer.layout = {
          ...layer.layout,
          'text-max-width': layers.labelMaxWidth,
        };
      }
    }
  });

  // Update grid layer if it exists
  const gridLayer = updatedStyle.layers.find((layer: any) => layer.id === 'grid');
  if (gridLayer && palette.grid) {
    gridLayer.paint = {
      ...gridLayer.paint,
      'line-color': palette.grid,
      'line-opacity': gridLayer.paint?.['line-opacity'] ?? 0.2,
    };
  }

  return updatedStyle;
}

