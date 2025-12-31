import { styles } from '../styles';
import type { PosterConfig } from '@/types/poster';
import { DEFAULT_CONFIG } from './defaults';

export interface PosterExample {
  id: string;
  name: string;
  description: string;
  config: PosterConfig;
}

const getStyle = (id: string) => styles.find(s => s.id === id) || styles[0];

export const POSTER_EXAMPLES: PosterExample[] = [
  {
    id: 'chesapeake',
    name: 'Chesapeake Bay',
    description: 'Vintage nautical style showing the vast bay network.',
    config: {
      ...DEFAULT_CONFIG,
      location: {
        name: 'Chesapeake Bay',
        city: 'The Chesapeke',
        subtitle: 'United States',
        center: [-76.17419096218805, 37.8593958816429] as [number, number],
        bounds: [[-76.35, 36.75], [-75.75, 37.15]] as [[number, number], [number, number]],
        zoom: 7.381973990444137,
      },
      style: getStyle('vintage'),
      palette: getStyle('vintage').palettes.find(p => p.id === 'vintage-parchment') || getStyle('vintage').defaultPalette,
      typography: {
        ...DEFAULT_CONFIG.typography,
        titleFont: 'Playfair Display',
        titleSize: 5.5,
        titleWeight: 700,
        titleLetterSpacing: 0.12,
        titleAllCaps: true,
        subtitleSize: 5.1,
        showTitle: false,
        backdropHeight: 62,
        backdropAlpha: 0.9,
      },
      format: {
        ...DEFAULT_CONFIG.format,
        aspectRatio: '2:3',
        margin: 8,
        borderStyle: 'double',
        texture: 'paper',
        textureIntensity: 18,
      },
      layers: {
        ...DEFAULT_CONFIG.layers,
        streets: true,
        water: true,
        terrain: true,
        hillshadeExaggeration: 0.8,
        contours: true,
        contourDensity: 50,
        marker: false,
      }
    }
  },
  {
    id: 'salt-lake-city',
    name: 'Salt Lake City',
    description: 'Dramatic "Midnight" view of the city between the mountains and the lake.',
    config: {
      ...DEFAULT_CONFIG,
      location: {
        name: 'Salt Lake City',
        city: 'Salt Lake City, UT',
        subtitle: 'Utah, United States',
        center: [-111.886797, 40.7596198] as [number, number],
        bounds: [[-112.1013916, 40.6999263], [-111.7404843, 40.8533905]] as [[number, number], [number, number]],
        zoom: 10,
      },
      style: getStyle('midnight'),
      palette: getStyle('midnight').palettes.find(p => p.id === 'midnight-classic') || getStyle('midnight').defaultPalette,
      typography: {
        ...DEFAULT_CONFIG.typography,
        titleFont: 'Outfit',
        titleSize: 5.5,
        titleWeight: 700,
        titleLetterSpacing: 0.12,
        titleAllCaps: true,
        subtitleFont: 'Outfit',
        subtitleSize: 5.1,
        showTitle: false,
        showSubtitle: true,
        showCoordinates: true,
        position: 'bottom',
        textBackdrop: 'gradient',
        backdropHeight: 62,
        backdropAlpha: 0.9,
        maxWidth: 80,
      },
      format: {
        ...DEFAULT_CONFIG.format,
        aspectRatio: '2:3',
        orientation: 'portrait',
        margin: 8,
        borderStyle: 'double',
        texture: 'paper',
        textureIntensity: 18,
      },
      layers: {
        ...DEFAULT_CONFIG.layers,
        streets: true,
        buildings: false,
        water: true,
        parks: true,
        terrain: true,
        hillshadeExaggeration: 1.0,
        contours: false,
        contourDensity: 10,
        population: false,
        labels: true,
        labelSize: 0.8,
        labelMaxWidth: 10,
        marker: false,
        markerType: 'crosshair',
        roadWeight: 0.1,
      }
    }
  }
];

