import type { PosterStyle, ColorPalette, LayerToggle } from '@/types/poster';
import { 
  getOpenFreeMapPlanetTileJsonUrl, 
  getContourTileJsonUrl, 
  getPopulationTileUrl,
  getTerrainRgbTileJsonUrl
} from '@/lib/styles/tileUrl';

const defaultPalette: ColorPalette = {
  id: 'watercolor-coastal',
  name: 'Coastal Wash',
  background: '#FAF8F5',      // Warm white
  primary: '#6E7078',         // Blue-gray
  secondary: '#B8BCBC',       // residential gray
  water: '#7BA3B8',           // Ocean blue
  greenSpace: '#A8B89C',      // Soft green
  text: '#4A5568',            // Cool gray
  accent: '#9CA5A8',
  contour: '#9CA5A8',
  population: '#6E7078',
  roads: {
    motorway: '#6E7078',      // Blue-gray
    trunk: '#787880',
    primary: '#828288',
    secondary: '#9CA0A0',
    tertiary: '#A8ACAC',
    residential: '#B8BCBC',
    service: '#C8CCCC',
  },
  landuse: '#F0EDE5',
  waterLine: '#5D8AA0',
  parks: '#A8B89C',
  buildings: '#E8E0D8',
  border: '#9CA5A8',
};

const mapStyle = {
  version: 8,
  name: 'Watercolor / Painted',
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
        'fill-translate': [2, 2], // Slight offset for organic feel
        'fill-antialias': true,
      },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': defaultPalette.waterLine || defaultPalette.water,
        'line-opacity': 0.7,
        'line-blur': 1,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.2,
          12, 2.0,
          14, 3.0,
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
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': defaultPalette.buildings || defaultPalette.secondary,
        'fill-opacity': 0.2,
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
        'line-blur': 0.5,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          13, 0.3,
          14, 0.7
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
        'line-blur': 0.5,
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
        'line-blur': 0.5,
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
        'line-blur': 0.5,
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
        'line-blur': 0.5,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.1,
          11, 1.5,
          12, 1.9,
          13, 2.4,
          14, 2.9
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
        'line-blur': 0.5,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 1.6,
          11, 2.1,
          12, 2.6,
          13, 3.2,
          14, 3.8
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
        'line-blur': 0.5,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, 2.0,
          11, 2.6,
          12, 3.2,
          13, 3.8,
          14, 4.4
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

export const watercolorStyle: PosterStyle = {
  id: 'watercolor',
  name: 'Watercolor / Painted',
  description: 'Soft, organic maps with diffuse edges and a hand-painted feel',
  thumbnail: '/thumbnails/watercolor.jpg',
  mapStyle: mapStyle,
  defaultPalette: defaultPalette,
  palettes: [defaultPalette],
  recommendedFonts: ['Quicksand', 'Nunito', 'Pacifico', 'Caveat'],
  layerToggles: layerToggles,
};

