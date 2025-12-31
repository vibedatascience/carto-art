// Core type definitions for the Map Poster Generator

export interface PosterLocation {
  name: string;
  city?: string; // New: specific city/municipality field
  subtitle?: string;
  center: [number, number]; // [lng, lat]
  bounds: [[number, number], [number, number]]; // SW, NE corners
  zoom: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  background: string;
  primary: string; // Main streets/features
  secondary: string; // Minor streets/features
  accent?: string; // Highlights or borders
  water: string;
  greenSpace: string;
  text: string;
  grid?: string; // For technical styles
  contour?: string; // New: Color for topo/contour lines
  population?: string; // New: Color for population density
  
  // New: Granular color overrides for specific styles
  roads?: {
    motorway: string;
    trunk: string;
    primary: string;
    secondary: string;
    tertiary: string;
    residential: string;
    service: string;
  };
  landuse?: string;
  waterLine?: string;
  parks?: string;
  buildings?: string;
  border?: string;
}

export interface LayerToggle {
  id: string;
  name: string;
  layerIds: string[]; // MapLibre layer IDs this toggle affects
}

export interface PosterStyle {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  mapStyle: any; // MapLibre style spec (using any for now as the spec is complex)
  defaultPalette: ColorPalette;
  palettes: ColorPalette[];
  recommendedFonts: string[];
  layerToggles: LayerToggle[];
}

export interface PosterConfig {
  location: PosterLocation;
  style: PosterStyle;
  palette: ColorPalette;
  typography: {
    titleFont: string;
    titleSize: number;
    titleWeight: number;
    titleLetterSpacing?: number; // Added tracking
    titleAllCaps?: boolean;      // Added all-caps support
    subtitleFont: string;
    subtitleSize: number;
    showTitle?: boolean;      // New: toggle title visibility
    showSubtitle?: boolean;   // New: toggle subtitle visibility
    showCoordinates?: boolean; // New: toggle coordinates visibility
    position: 'top' | 'bottom' | 'center';
    textBackdrop?: 'none' | 'subtle' | 'strong' | 'gradient'; // Added gradient type
    backdropHeight?: number; // percentage (0-100)
    backdropAlpha?: number;  // opacity (0-1)
    maxWidth?: number; // New: max width percentage (0-100)
  };
  format: {
    aspectRatio: '2:3' | '3:4' | '4:5' | '1:1' | 'ISO';
    orientation: 'portrait' | 'landscape';
    margin: number; // 0-100 (percentage based)
    borderStyle: 'none' | 'thin' | 'thick' | 'double' | 'inset';
    texture?: 'none' | 'paper' | 'canvas' | 'grain'; // Added texture support
    textureIntensity?: number; // 0-100
  };
  layers: {
    streets: boolean;
    buildings: boolean;
    water: boolean;
    parks: boolean;
    terrain: boolean;
    contours: boolean;
    contourDensity: number; // New: control contour line density (interval)
    population: boolean;
    labels: boolean;
    labelSize: number; // New: control map label size
    labelMaxWidth: number; // New: control map label wrap width
    marker: boolean;
  };
}

