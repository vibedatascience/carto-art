import type { PosterStyle, ColorPalette, LayerToggle } from '@/types/poster';
import { 
  getOpenFreeMapPlanetTileJsonUrl, 
  getContourTileJsonUrl, 
  getPopulationTileUrl,
  getTerrainRgbTileJsonUrl
} from '@/lib/styles/tileUrl';

const defaultPalette: ColorPalette = {
  id: 'topo-survey',
  name: 'Survey',
  background: '#F5F2E8',      // Cream
  primary: '#5C4830',         // Dark brown
  secondary: '#B89870',       // residential tan
  water: '#B8D4E8',           // Clear blue
  greenSpace: '#D8E4D0',      // Muted green
  text: '#3C3020',
  accent: '#5C4830',
  contour: '#8B7355',
  population: '#5C4830',
  roads: {
    motorway: '#5C4830',      // Dark brown
    trunk: '#6E5840',
    primary: '#806848',
    secondary: '#927850',
    tertiary: '#A48860',
    residential: '#B89870',
    service: '#C8A880',
  },
  landuse: '#EBE8DE',
  waterLine: '#7BA3C4',
  parks: '#D8E4D0',
  buildings: '#EBE8DE',
  border: '#5C4830',
};

const mapStyle = {
  version: 8,
  name: 'Topographic / Contour',
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
      minzoom: 9,
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
        'hillshade-shadow-color': '#5C4830',
        'hillshade-highlight-color': '#FFFFFF',
        'hillshade-accent-color': '#5C4830',
        'hillshade-exaggeration': 0.15,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': defaultPalette.water,
        'fill-opacity': 0.8,
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
        'line-opacity': 0.9,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.0,
          12, 1.5,
          14, 2.0,
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
        'fill-opacity': 0.4,
      },
    },
    {
      id: 'contours-regular',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      filter: ['!=', ['%', ['get', 'ele'], 50], 0],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#B8A080',
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.3,
          12, 0.5,
          14, 0.7,
        ],
        'line-opacity': 0.4,
      },
    },
    {
      id: 'contours-index',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      // Every 5th line (assuming 10m intervals, so every 50m)
      filter: ['==', ['%', ['get', 'ele'], 50], 0],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#8B7355',
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.6,
          12, 0.9,
          14, 1.2,
        ],
        'line-opacity': 0.6,
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
          12, 0.2,
          13, 0.4,
          14, 0.6
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
      paint: {
        'line-color': defaultPalette.roads?.residential || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          11, 0.2,
          12, 0.4,
          13, 0.6,
          14, 0.9
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
          11, 0.4,
          12, 0.6,
          13, 0.9,
          14, 1.2
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
          10, 0.5,
          11, 0.7,
          12, 1.0,
          13, 1.3,
          14, 1.6
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
          10, 0.8,
          11, 1.1,
          12, 1.4,
          13, 1.7,
          14, 2.0
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
          10, 1.2,
          11, 1.5,
          12, 1.8,
          13, 2.2,
          14, 2.6
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
          10, 1.5,
          11, 1.8,
          12, 2.2,
          13, 2.6,
          14, 3.0
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
    layerIds: ['contours-regular', 'contours-index'],
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

export const topographicStyle: PosterStyle = {
  id: 'topographic',
  name: 'Topographic / Contour',
  description: 'Terrain-focused maps with detailed elevation contours and hillshading',
  thumbnail: '/thumbnails/topographic.jpg',
  mapStyle: mapStyle,
  defaultPalette: defaultPalette,
  palettes: [defaultPalette],
  recommendedFonts: ['Montserrat', 'Work Sans', 'Public Sans', 'IBM Plex Sans'],
  layerToggles: layerToggles,
};

