import type { ColorPalette } from '@/types/poster';

export interface BaseLayerOptions {
  waterFilter?: any[]; // Optional filter for water layer (e.g., exclude piers/bridges)
  waterOpacity?: number;
  waterwayOpacity?: number;
  parkOpacity?: number;
  buildingsOpacity?: number;
  populationOpacity?: {
    stops: [number, number][]; // [[0, 0], [1, 0.05], [100, 0.15], ...]
  };
}

/**
 * Creates base layers (background, water, waterway, parks, buildings, population)
 * that are common across all map styles.
 */
export function createBaseLayers(
  palette: ColorPalette,
  options: BaseLayerOptions = {}
): any[] {
  const {
    waterFilter,
    waterOpacity = 0.6,
    waterwayOpacity = 0.7,
    parkOpacity = 0.3,
    buildingsOpacity = 0.15,
    populationOpacity,
  } = options;

  const defaultPopulationOpacity: [number, number][] = [
    [0, 0],
    [1, 0.05],
    [100, 0.15],
    [1000, 0.3],
    [10000, 0.5],
  ];

  const layers: any[] = [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': palette.background,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      ...(waterFilter ? { filter: waterFilter } : {}),
      paint: {
        'fill-color': palette.water,
        'fill-opacity': waterOpacity,
      },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      paint: {
        'line-color': palette.waterLine || palette.water,
        'line-opacity': waterwayOpacity,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.5,
          12, 1.0,
          14, 1.5,
        ],
      },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: {
        'fill-color': palette.greenSpace || palette.parks,
        'fill-opacity': parkOpacity,
      },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': palette.buildings || palette.primary || palette.secondary || palette.text,
        'fill-opacity': buildingsOpacity,
      },
    },
    // 3D extruded buildings layer (hidden by default, enabled via layers.buildings3D)
    {
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 14,
      layout: {
        visibility: 'none', // Hidden by default
      },
      paint: {
        'fill-extrusion-color': palette.buildings || palette.primary || palette.secondary || palette.text,
        'fill-extrusion-height': [
          'interpolate', ['linear'], ['zoom'],
          14, 0,
          15, ['coalesce', ['get', 'render_height'], 10]
        ],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.85,
      },
    },
    {
      id: 'population-density',
      type: 'fill',
      source: 'population',
      'source-layer': 'stats',
      paint: {
        'fill-color': palette.population || palette.accent || palette.primary || palette.roads?.motorway || palette.text,
        'fill-opacity': [
          'interpolate',
          ['linear'],
          ['get', 'population'],
          ...(populationOpacity?.stops || defaultPopulationOpacity).flat(),
        ],
      },
    },
  ];

  return layers;
}

