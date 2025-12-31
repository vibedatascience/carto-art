import type { PosterStyle, ColorPalette, LayerToggle } from '@/types/poster';
import { 
  getOpenFreeMapPlanetTileJsonUrl, 
  getContourTileJsonUrl, 
  getPopulationTileUrl,
  getTerrainRgbTileJsonUrl
} from '@/lib/styles/tileUrl';

const defaultPalette: ColorPalette = {
  id: 'minimal-ink',
  name: 'Ink & Paper',
  background: '#F7F5F0',      // Warm white
  primary: '#2C2C2C',         // soft black
  secondary: '#6E6E6E',       // residential gray
  water: '#E0E7ED',           // Very muted blue-gray
  greenSpace: '#EDEEE8',      // Barely-there sage tint
  text: '#2C2C2C',
  accent: '#2C2C2C',
  contour: '#5C5C5C',
  population: '#2C2C2C',
  roads: {
    motorway: '#2C2C2C',      // Soft black
    trunk: '#2C2C2C',
    primary: '#3D3D3D',
    secondary: '#4A4A4A',
    tertiary: '#5C5C5C',
    residential: '#6E6E6E',
    service: '#8A8A8A',
  },
  landuse: '#F0EDE6',
  waterLine: '#C8D4DC',
  parks: '#EDEEE8',
  buildings: '#EBE8E2',
  border: '#2C2C2C',
};

const blushPalette: ColorPalette = {
  id: 'minimal-blush',
  name: 'Blush',
  background: '#F8F4F1', // warm cream
  primary: '#6B5B5B',    // dusty mauve-brown
  secondary: '#8B7E7E',  // lighter mauve
  water: '#D4E4ED',      // pale blue
  greenSpace: '#E2E8DC', // pale sage
  text: '#4A3F3F',       // dark mauve
  accent: '#6B5B5B',
  contour: '#8B7E7E',
  population: '#6B5B5B',
};

const charcoalPalette: ColorPalette = {
  id: 'minimal-charcoal',
  name: 'Charcoal',
  background: '#F5F5F0', // off-white
  primary: '#2D2D2D',    // charcoal
  secondary: '#666666',
  water: '#B8C5D0',
  greenSpace: '#C5CBBA',
  text: '#2D2D2D',
  accent: '#2D2D2D',
  contour: '#666666',
  population: '#2D2D2D',
};

const navyCreamPalette: ColorPalette = {
  id: 'minimal-navy',
  name: 'Navy & Cream',
  background: '#FDF6E3', // cream
  primary: '#1E3A5F',    // navy
  secondary: '#3E5C81',
  water: '#B8C5D0',
  greenSpace: '#C5CBBA',
  text: '#1E3A5F',
  accent: '#1E3A5F',
  contour: '#3E5C81',
  population: '#1E3A5F',
};

const midnightPalette: ColorPalette = {
  id: 'minimal-midnight',
  name: 'Midnight',
  background: '#0D1B2A', // deep navy
  primary: '#E0E1DD',    // off-white
  secondary: '#A0A090',
  water: '#1B263B',      // slightly lighter navy
  greenSpace: '#1B263B', // same as water
  text: '#E0E1DD',
  accent: '#E0E1DD',
  contour: '#A0A090',
  population: '#E0E1DD',
};

const warmGrayPalette: ColorPalette = {
  id: 'minimal-warm-gray',
  name: 'Warm Gray',
  background: '#FAF8F5', // warm white
  primary: '#4A4A4A',    // warm gray
  secondary: '#888888',
  water: '#B8C5D0',
  greenSpace: '#C5CBBA',
  text: '#4A4A4A',
  accent: '#4A4A4A',
  contour: '#888888',
  population: '#4A4A4A',
};

const mapStyle = {
  version: 8,
  name: 'Minimal Line Art',
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
      id: 'hillshade',
      type: 'hillshade',
      source: 'terrain',
      paint: {
        'hillshade-shadow-color': defaultPalette.secondary,
        'hillshade-highlight-color': defaultPalette.background,
        'hillshade-accent-color': defaultPalette.secondary,
        'hillshade-exaggeration': 0.6,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      filter: ['all', ['!=', ['get', 'class'], 'pier'], ['!=', ['get', 'brunnel'], 'bridge']],
      paint: {
        'fill-color': defaultPalette.water,
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      paint: {
        'line-color': defaultPalette.waterLine || defaultPalette.water,
        'line-opacity': 0.7,
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
        'fill-color': defaultPalette.greenSpace,
        'fill-opacity': 0.3,
      },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': defaultPalette.buildings || defaultPalette.secondary,
        'fill-opacity': 0.15,
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
      paint: {
        'line-color': defaultPalette.roads?.service || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
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
        ['>=', ['zoom'], 12]
      ],
      paint: {
        'line-color': defaultPalette.roads?.residential || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          12, 0.4,
          13, 0.7,
          14, 1.0
        ],
      },
    },
    {
      id: 'road-tertiary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'tertiary'],
      paint: {
        'line-color': defaultPalette.roads?.tertiary || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.3,
          11, 0.5,
          12, 0.8,
          13, 1.1,
          14, 1.4
        ],
      },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'secondary'],
      paint: {
        'line-color': defaultPalette.roads?.secondary || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.6,
          11, 0.9,
          12, 1.2,
          13, 1.6,
          14, 2.0
        ],
      },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'primary'],
      paint: {
        'line-color': defaultPalette.roads?.primary || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.0,
          11, 1.4,
          12, 1.8,
          13, 2.2,
          14, 2.6
        ],
      },
    },
    {
      id: 'road-trunk',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'trunk'],
      paint: {
        'line-color': defaultPalette.roads?.trunk || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.5,
          11, 2.0,
          12, 2.5,
          13, 3.0,
          14, 3.5
        ],
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      paint: {
        'line-color': defaultPalette.roads?.motorway || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 2.0,
          11, 2.5,
          12, 3.0,
          13, 3.5,
          14, 4.0
        ],
      },
    },
    {
      id: 'bridge-motorway-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['all', ['==', ['get', 'class'], 'motorway'], ['==', ['get', 'brunnel'], 'bridge']],
      paint: {
        'line-color': defaultPalette.background,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 2.0 * 1.5,
          11, 2.5 * 1.5,
          12, 3.0 * 1.5,
          13, 3.5 * 1.5,
          14, 4.0 * 1.5
        ],
      },
    },
    {
      id: 'bridge-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['all', ['==', ['get', 'class'], 'motorway'], ['==', ['get', 'brunnel'], 'bridge']],
      paint: {
        'line-color': defaultPalette.roads?.motorway || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 2.0 * 1.1,
          11, 2.5 * 1.1,
          12, 3.0 * 1.1,
          13, 3.5 * 1.1,
          14, 4.0 * 1.1
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
          0, 0,      // 0 population = 0 opacity (fixes ocean hexes)
          1, 0.05,   // Very faint at 1 person
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
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
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
      'road-motorway',
      'bridge-motorway-casing',
      'bridge-motorway'
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

export const minimalStyle: PosterStyle = {
  id: 'minimal',
  name: 'Minimal Line Art',
  description: 'Clean, monochromatic street maps with minimal detail',
  thumbnail: '/thumbnails/minimal.jpg',
  mapStyle: mapStyle,
  defaultPalette: defaultPalette,
  palettes: [defaultPalette, blushPalette, charcoalPalette, navyCreamPalette, midnightPalette, warmGrayPalette],
  recommendedFonts: ['Inter', 'Helvetica Neue', 'Outfit', 'DM Sans'],
  layerToggles: layerToggles,
};

