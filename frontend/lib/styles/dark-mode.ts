import type { PosterStyle, ColorPalette, LayerToggle } from '@/types/poster';
import { 
  getOpenFreeMapPlanetTileJsonUrl, 
  getContourTileJsonUrl, 
  getPopulationTileUrl,
  getTerrainRgbTileJsonUrl
} from '@/lib/styles/tileUrl';

const defaultPalette: ColorPalette = {
  id: 'dark-midnight',
  name: 'Midnight',
  background: '#0D1B2A', // deep navy
  primary: '#E0E1DD',    // off-white
  secondary: '#6b7280',  // muted gray
  water: '#1B263B',      // slightly lighter navy
  greenSpace: '#0f1923', // dark forest/black
  text: '#E0E1DD',
  accent: '#E0E1DD',
  contour: '#6b7280',
  population: '#E0E1DD',
};

const goldPalette: ColorPalette = {
  id: 'dark-gold',
  name: 'Gold Standard',
  background: '#0A0A0A', // near black
  primary: '#D4AF37',    // gold
  secondary: '#8B7355',  // tan-brown
  water: '#1A1A2E',      // dark blue-black
  greenSpace: '#0F1A0F', // dark forest
  text: '#D4AF37',
  accent: '#E8C547',     // bright gold
  contour: '#8B7355',
  population: '#D4AF37',
};

const roseNightPalette: ColorPalette = {
  id: 'dark-rose',
  name: 'Rose Night',
  background: '#1A0F14', // deep burgundy-black
  primary: '#F5E6E8',    // pale pink-white
  secondary: '#8B7E7E',
  water: '#1A1A2E',
  greenSpace: '#0F1A14',
  text: '#E8B4B8',       // rose gold
  accent: '#E8B4B8',
  contour: '#8B7E7E',
  population: '#E8B4B8',
};

const neonNoirPalette: ColorPalette = {
  id: 'dark-neon',
  name: 'Neon Noir',
  background: '#0B0B1A', // deep blue-black
  primary: '#00F5FF',    // cyan
  secondary: '#FFFFFF',  // white
  water: '#0F1A2E',      // dark blue
  greenSpace: '#0A1F0A', // dark green
  text: '#FFFFFF',
  accent: '#00F5FF',
  contour: '#00F5FF',
  population: '#00F5FF',
};

const classicDarkPalette: ColorPalette = {
  id: 'dark-classic',
  name: 'Deep Navy',
  background: '#0B1929', // deep navy
  primary: '#F5F5F5',    // white
  secondary: '#A0A0A0',
  water: '#1A1A2E',
  greenSpace: '#0A1A0A',
  text: '#F5F5F5',
  accent: '#F5F5F5',
  contour: '#A0A0A0',
  population: '#F5F5F5',
};

const charcoalCyanPalette: ColorPalette = {
  id: 'dark-cyan',
  name: 'Charcoal Cyan',
  background: '#1A1A2E', // charcoal
  primary: '#00D4FF',    // cyan
  secondary: '#E0E1DD',  // off-white
  water: '#0D1B2A',
  greenSpace: '#0F1A0F',
  text: '#00D4FF',
  accent: '#00D4FF',
  contour: '#E0E1DD',
  population: '#00D4FF',
};

const mapStyle = {
  version: 8,
  name: 'Dark Mode / Noir',
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
        'hillshade-shadow-color': '#000000',
        'hillshade-highlight-color': defaultPalette.secondary,
        'hillshade-accent-color': '#000000',
        'hillshade-exaggeration': 0.6,
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
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': defaultPalette.primary,
        'fill-opacity': 0.4,
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
          1, 0.1,    // 10% opacity at 1 person
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
        'line-opacity': 0.6,
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

export const darkModeStyle: PosterStyle = {
  id: 'dark-mode',
  name: 'Dark Mode / Noir',
  description: 'Dramatic dark maps with luminous street networks',
  thumbnail: '/thumbnails/dark-mode.jpg',
  mapStyle: mapStyle,
  defaultPalette: defaultPalette,
  palettes: [defaultPalette, goldPalette, roseNightPalette, neonNoirPalette, classicDarkPalette, charcoalCyanPalette],
  recommendedFonts: ['Montserrat', 'Poppins', 'Bebas Neue', 'Oswald'],
  layerToggles: layerToggles,
};

