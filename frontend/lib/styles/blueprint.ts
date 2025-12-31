import type { PosterStyle, ColorPalette, LayerToggle } from '@/types/poster';
import { 
  getOpenFreeMapPlanetTileJsonUrl, 
  getContourTileJsonUrl, 
  getPopulationTileUrl,
  getTerrainRgbTileJsonUrl
} from '@/lib/styles/tileUrl';

const defaultPalette: ColorPalette = {
  id: 'blueprint-classic',
  name: 'Classic Blueprint',
  background: '#0A2647',      // Prussian blue
  primary: '#FFFFFF',         // Pure white
  secondary: '#88A8C8',       // residential blue
  water: '#072035',           // Darker blue
  greenSpace: '#0A3040',      // Blue-green hint
  text: '#E8F1F5',
  accent: '#E8F1F5',
  grid: '#1A3A5C',            // Subtle grid overlay
  contour: '#E8F1F5',
  population: '#FFFFFF',
  roads: {
    motorway: '#FFFFFF',      // Pure white for max contrast
    trunk: '#F0F4F8',
    primary: '#E0E8F0',
    secondary: '#C8D8E8',
    tertiary: '#A8C0D8',
    residential: '#88A8C8',
    service: '#6890B0',
  },
  landuse: '#0D2D52',
  waterLine: '#1A4060',
  parks: '#0A3040',
  buildings: '#0F3355',
  border: '#E8F1F5',
};

const architectPalette: ColorPalette = {
  id: 'blueprint-architect',
  name: 'Architect',
  background: '#1C2833', // dark blue-gray
  primary: '#D4E6F1',    // pale blue
  secondary: '#AED6F1',  // light cyan
  water: '#1B2631',      // slightly different dark
  greenSpace: '#212F3D',
  text: '#D4E6F1',
  accent: '#D4E6F1',
  grid: '#2E4053',       // medium blue-gray grid
  contour: '#AED6F1',
  population: '#D4E6F1',
};

const cyanNavyPalette: ColorPalette = {
  id: 'blueprint-cyan',
  name: 'Cyan Navy',
  background: '#001F3F', // navy
  primary: '#7DF9FF',    // cyan
  secondary: '#FFFFFF',  // white
  water: '#00152B',
  greenSpace: '#002A4A',
  text: '#7DF9FF',
  accent: '#7DF9FF',
  grid: '#003366',
  contour: '#7DF9FF',
  population: '#7DF9FF',
};

const darkBluePalette: ColorPalette = {
  id: 'blueprint-dark-blue',
  name: 'Technical Dark',
  background: '#0A2342', // dark blue
  primary: '#B0D4F1',    // light blue
  secondary: '#E8F1F5',  // blue-white
  water: '#05162B',
  greenSpace: '#0D2D50',
  text: '#B0D4F1',
  accent: '#B0D4F1',
  grid: '#1A3A5C',
  contour: '#E8F1F5',
  population: '#B0D4F1',
};

const mapStyle = {
  version: 8,
  name: 'Blueprint / Technical',
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
        'hillshade-shadow-color': '#061322', // Very dark blue for blueprint shadows
        'hillshade-highlight-color': defaultPalette.secondary,
        'hillshade-accent-color': '#061322',
        'hillshade-exaggeration': 0.5,
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
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: {
        'fill-color': defaultPalette.greenSpace,
        'fill-opacity': 0.25,
      },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': defaultPalette.buildings || defaultPalette.primary,
        'fill-opacity': 0.2,
        'fill-outline-color': '#4A6A8A',
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
        'line-cap': 'square',
        'line-join': 'miter',
      },
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
      layout: {
        'line-cap': 'square',
        'line-join': 'miter',
      },
      paint: {
        'line-color': defaultPalette.roads?.residential || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          11, 0.2,
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
      layout: {
        'line-cap': 'square',
        'line-join': 'miter',
      },
      paint: {
        'line-color': defaultPalette.roads?.tertiary || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.3,
          11, 0.5,
          12, 0.7,
          13, 1.0,
          14, 1.3
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
        'line-cap': 'square',
        'line-join': 'miter',
      },
      paint: {
        'line-color': defaultPalette.roads?.secondary || defaultPalette.secondary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 0.6,
          11, 0.8,
          12, 1.1,
          13, 1.4,
          14, 1.8
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
        'line-cap': 'square',
        'line-join': 'miter',
      },
      paint: {
        'line-color': defaultPalette.roads?.primary || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.0,
          11, 1.3,
          12, 1.6,
          13, 2.0,
          14, 2.4
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
        'line-cap': 'square',
        'line-join': 'miter',
      },
      paint: {
        'line-color': defaultPalette.roads?.trunk || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.4,
          11, 1.8,
          12, 2.2,
          13, 2.6,
          14, 3.0
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
        'line-cap': 'square',
        'line-join': 'miter',
      },
      paint: {
        'line-color': defaultPalette.roads?.motorway || defaultPalette.primary,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.8,
          11, 2.2,
          12, 2.6,
          13, 3.0,
          14, 3.4
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
          1, 0.1,
          100, 0.25,
          1000, 0.45,
          10000, 0.7
        ],
      },
    },
    {
      id: 'contours',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      layout: {
        'line-join': 'miter',
        'line-cap': 'square',
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
            [12, 14],
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
    layerIds: ['water'],
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

export const blueprintStyle: PosterStyle = {
  id: 'blueprint',
  name: 'Blueprint / Technical',
  description: 'Architectural blueprint style with high-contrast lines on deep blue',
  thumbnail: '/thumbnails/blueprint.jpg',
  mapStyle: mapStyle,
  defaultPalette: defaultPalette,
  palettes: [defaultPalette, architectPalette, cyanNavyPalette, darkBluePalette],
  recommendedFonts: ['JetBrains Mono', 'IBM Plex Mono', 'Space Mono', 'Roboto Mono'],
  layerToggles: layerToggles,
};

