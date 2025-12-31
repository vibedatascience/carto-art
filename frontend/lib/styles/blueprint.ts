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
  background: '#0A2647', // Prussian blue
  primary: '#FFFFFF',    // white
  secondary: '#E8F1F5',  // blue-white
  water: '#082540',      // darker blue
  greenSpace: '#0A3040', // blue-green hint
  text: '#E8F1F5',
  accent: '#FFFFFF',
  grid: '#1A3A5C',       // lighter blue grid
  contour: '#E8F1F5',
  population: '#FFFFFF',
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
      },
    },
    {
      id: 'buildings',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'line-color': defaultPalette.primary,
        'line-width': 0.8,
        'line-opacity': 0.8,
      },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: {
        'fill-color': defaultPalette.greenSpace,
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
      id: 'road-street',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['street', 'path']]],
      paint: {
        'line-color': defaultPalette.secondary,
        'line-width': {
          base: 1.2,
          stops: [
            [12, 0.5],
            [20, 2],
          ],
        },
        'line-opacity': 0.7,
      },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary']]],
      paint: {
        'line-color': defaultPalette.primary,
        'line-width': {
          base: 1.2,
          stops: [
            [10, 1],
            [20, 4],
          ],
        },
        'line-opacity': 0.9,
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      paint: {
        'line-color': defaultPalette.primary,
        'line-width': {
          base: 1.2,
          stops: [
            [8, 1.5],
            [20, 6],
          ],
        },
        'line-opacity': 1,
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
    layerIds: ['road-street', 'road-primary', 'road-motorway'],
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

