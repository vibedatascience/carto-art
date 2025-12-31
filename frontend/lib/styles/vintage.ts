import type { PosterStyle, ColorPalette, LayerToggle } from '@/types/poster';
import { 
  getOpenFreeMapPlanetTileJsonUrl, 
  getContourTileJsonUrl, 
  getPopulationTileUrl,
  getTerrainRgbTileJsonUrl
} from '@/lib/styles/tileUrl';

const defaultPalette: ColorPalette = {
  id: 'vintage-parchment',
  name: 'Parchment',
  background: '#F4E4C8',      // Aged cream
  primary: '#3C2F1F',         // Dark brown
  secondary: '#907E68',       // residential sepia
  water: '#B8C5C0',           // Faded blue-green
  greenSpace: '#D4D4B8',      // Muted olive-sage
  text: '#3C2F1F',
  accent: '#8B7355',
  contour: '#8B7355',
  population: '#3C2F1F',
  roads: {
    motorway: '#3C2F1F',      // Dark brown
    trunk: '#4A3A28',
    primary: '#5D4E37',       // Sepia
    secondary: '#6E5E48',
    tertiary: '#806E58',
    residential: '#907E68',
    service: '#A08E78',
  },
  landuse: '#EBD9B8',
  waterLine: '#8AA0A0',
  parks: '#D4D4B8',
  buildings: '#E0D4BC',
  border: '#8B7355',
};

const mapStyle = {
  version: 8,
  name: 'Vintage / Antique',
  metadata: {
    'mapbox:autocomposite': false,
  },
  sources: {
    openmaptiles: {
      type: 'vector',
      url: getOpenFreeMapPlanetTileJsonUrl(),
      minzoom: 0,
      maxzoom: 14,
    },
    contours: {
      type: 'vector',
      url: getContourTileJsonUrl() || '',
      minzoom: 0,
      maxzoom: 14,
    },
    population: {
      type: 'vector',
      tiles: [getPopulationTileUrl()],
      minzoom: 0,
      maxzoom: 14,
      attribution: '<a href="https://www.kontur.io/portfolio/population-dataset/" target="_blank">Kontur Population</a>',
    },
    terrain: {
      type: 'raster-dem',
      url: getTerrainRgbTileJsonUrl() || '',
      tileSize: 256,
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': defaultPalette.background,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': defaultPalette.water,
        'fill-opacity': 0.7,
        'fill-outline-color': defaultPalette.waterLine || defaultPalette.water,
      },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      paint: {
        'line-color': defaultPalette.waterLine || defaultPalette.water,
        'line-opacity': 0.8,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.8,
          12, 1.5,
          14, 2.2,
        ],
      },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: {
        'fill-color': defaultPalette.greenSpace,
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': defaultPalette.buildings || defaultPalette.secondary,
        'fill-opacity': 0.25,
      },
    },
    {
      id: 'road-service',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['all', 
        ['in', ['get', 'class'], ['literal', ['service', 'path', 'track']]],
        ['>=', ['zoom'], 13]
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.service || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          12, 0.2,
          13, 0.3,
          14, 0.5
        ],
      },
    },
    {
      id: 'road-residential',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['all',
        ['in', ['get', 'class'], ['literal', ['residential', 'living_street']]],
        ['>=', ['zoom'], 11]
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.residential || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          11, 0.3,
          12, 0.5,
          13, 0.8,
          14, 1.1
        ],
      },
    },
    {
      id: 'road-tertiary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'tertiary'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.tertiary || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.4,
          11, 0.6,
          12, 0.9,
          13, 1.2,
          14, 1.5
        ],
      },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'secondary'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.secondary || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.7,
          11, 1.0,
          12, 1.3,
          13, 1.7,
          14, 2.1
        ],
      },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'primary'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.primary || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.2,
          11, 1.6,
          12, 2.0,
          13, 2.5,
          14, 3.0
        ],
      },
    },
    {
      id: 'road-trunk',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'trunk'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.trunk || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.8,
          11, 2.3,
          12, 2.8,
          13, 3.4,
          14, 4.0
        ],
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.roads?.motorway || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 2.2,
          11, 2.8,
          12, 3.4,
          13, 4.0,
          14, 4.6
        ],
      },
    },
    {
      id: 'population-density',
      type: 'fill',
      source: 'population',
      'source-layer': 'stats',
      paint: {
        'fill-color': defaultPalette.population,
        'fill-opacity': [
          'interpolate',
          ['linear'],
          ['get', 'population'],
          0, 0,
          1, 0.05,
          100, 0.15,
          1000, 0.3,
          10000, 0.5
        ],
      },
    },
    {
      id: 'contours',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': defaultPalette.contour,
        'line-width': 0.5,
        'line-opacity': 0.4,
      },
    },
    {
      id: 'labels-place',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: {
        'text-field': '{name:en}',
        'text-font': ['Noto Sans Regular'],
        'text-size': {
          stops: [
            [4, 10],
            [12, 16],
          ],
        },
      },
      paint: {
        'text-color': defaultPalette.text,
        'text-halo-color': defaultPalette.background,
        'text-halo-width': 1,
      },
    },
  ],
};

const layerToggles: LayerToggle[] = [
  {
    id: 'streets',
    name: 'Streets',
    layerIds: [
      'road-service', 
      'road-residential', 
      'road-tertiary', 
      'road-secondary', 
      'road-primary', 
      'road-trunk', 
      'road-motorway'
    ],
  },
  {
    id: 'buildings',
    name: 'Buildings',
    layerIds: ['buildings'],
  },
  {
    id: 'water',
    name: 'Water',
    layerIds: ['water', 'waterway'],
  },
  {
    id: 'parks',
    name: 'Parks',
    layerIds: ['park'],
  },
  {
    id: 'terrain',
    name: 'Terrain Shading',
    layerIds: ['hillshade'],
  },
  {
    id: 'contours',
    name: 'Topography (Contours)',
    layerIds: ['contours'],
  },
  {
    id: 'population',
    name: 'Population Density',
    layerIds: ['population-density'],
  },
  {
    id: 'labels',
    name: 'Labels',
    layerIds: ['labels-place'],
  },
];

export const vintageStyle: PosterStyle = {
  id: 'vintage',
  name: 'Vintage / Antique',
  description: 'Warm, nostalgic maps with aged parchment and sepia tones',
  thumbnail: '/thumbnails/vintage.jpg',
  mapStyle: mapStyle,
  defaultPalette: defaultPalette,
  palettes: [defaultPalette],
  recommendedFonts: ['IM Fell English', 'Playfair Display', 'EB Garamond', 'Cormorant Garamond'],
  layerToggles: layerToggles,
};

