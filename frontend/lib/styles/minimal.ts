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
  background: '#F7F5F0', // warm white
  primary: '#2C2C2C',    // soft black
  secondary: '#4A4A4A',  // warm gray
  water: '#B8C5D0',      // muted blue-gray
  greenSpace: '#C5CBBA', // muted sage
  text: '#2C2C2C',
  accent: '#2C2C2C',
  contour: '#4A4A4A',
  population: '#2C2C2C',
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
      // Filter out small spiky bits (piers/docks) if they are tagged as such
      filter: ['all', ['!=', ['get', 'class'], 'pier'], ['!=', ['get', 'brunnel'], 'bridge']],
      paint: {
        'fill-color': defaultPalette.water,
      },
    },
    {
      id: 'water-offset',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'line-color': defaultPalette.primary,
        'line-opacity': 0.15,
        'line-width': 1,
        'line-offset': 1,
      },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': defaultPalette.secondary,
        'fill-opacity': 0.4,
        'fill-outline-color': defaultPalette.primary,
      },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: {
        'fill-color': defaultPalette.greenSpace,
        'fill-opacity': 0.35, // Toned down parks for minimal style
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
      id: 'road-service',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['service', 'path', 'track']]],
      paint: {
        'line-color': defaultPalette.secondary,
        'line-opacity': 0.5,
        'line-width': {
          base: 1.1,
          stops: [
            [12, 0.2],
            [20, 1],
          ],
        },
      },
    },
    {
      id: 'road-street',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['street', 'residential', 'tertiary']]],
      paint: {
        'line-color': defaultPalette.secondary,
        'line-width': {
          base: 1.2,
          stops: [
            [12, 0.5],
            [20, 2.5],
          ],
        },
      },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary']]],
      paint: {
        'line-color': defaultPalette.primary,
        'line-width': {
          base: 1.2,
          stops: [
            [10, 0.8],
            [20, 5],
          ],
        },
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]],
      paint: {
        'line-color': defaultPalette.primary,
        // Slight opacity differentiation for highways in Minimal
        'line-opacity': 0.95,
        'line-width': {
          base: 1.3,
          stops: [
            [8, 1.2],
            [20, 9],
          ],
        },
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
    layerIds: ['road-service', 'road-street', 'road-primary', 'road-motorway'],
  },
  {
    id: 'buildings',
    name: 'Buildings',
    layerIds: ['buildings'],
  },
  {
    id: 'water',
    name: 'Water',
    layerIds: ['water', 'water-offset'],
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

