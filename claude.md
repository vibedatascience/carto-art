# Map Poster Generator - Development Context

## Project Summary

A web application that generates beautifully stylized map posters from real geographic data. Users select a location, choose an artistic style, customize colors and typography, then export high-resolution images suitable for large-format printing.

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Map Rendering**: MapLibre GL JS 4.7.1 with React Map GL 7.1.9
- **Data Sources**: OpenStreetMap vector tiles via OpenFreeMap
- **Database**: Supabase (PostgreSQL) for auth and data persistence
- **AI**: Claude API for natural language map generation

## Project Structure

```
carto-art/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/generate/        # AI generation endpoint
│   │   │   ├── geocode/            # Geocoding proxy
│   │   │   ├── publish/            # Map publishing
│   │   │   ├── tiles/[...path]/    # Tile proxy
│   │   │   └── spaceports/         # Data endpoints
│   │   ├── ai/page.tsx             # AI Creator page
│   │   ├── feed/page.tsx           # Community feed
│   │   ├── login/page.tsx          # Authentication
│   │   ├── map/[id]/page.tsx       # Shared map view
│   │   ├── profile/page.tsx        # User profile
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main editor
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── auth/                   # Auth components
│   │   ├── comments/               # Comment system
│   │   ├── controls/               # Editor controls (10 components)
│   │   │   ├── AccountPanel.tsx
│   │   │   ├── ColorControls.tsx
│   │   │   ├── ExamplesGallery.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── FormatControls.tsx
│   │   │   ├── LayerControls.tsx
│   │   │   ├── LocationSearch.tsx
│   │   │   ├── SavedProjects.tsx
│   │   │   ├── StyleSelector.tsx
│   │   │   └── TypographyControls.tsx
│   │   ├── layout/
│   │   │   ├── ControlDrawer.tsx   # Collapsible sidebar
│   │   │   ├── PosterEditor.tsx    # Main editor
│   │   │   └── TabNavigation.tsx   # Sidebar navigation
│   │   ├── map/
│   │   │   ├── MapPreview.tsx      # MapLibre wrapper
│   │   │   ├── PosterThumbnail.tsx # Thumbnail renderer
│   │   │   └── TextOverlay.tsx     # Text overlay
│   │   ├── profile/                # Profile components
│   │   └── ui/                     # Shared UI components
│   ├── hooks/
│   │   ├── useMapExport.ts         # Export logic
│   │   └── usePosterConfig.ts      # State management
│   ├── lib/
│   │   ├── actions/                # Server actions
│   │   ├── ai/                     # AI configuration
│   │   ├── config/                 # App configuration
│   │   ├── export/                 # Export utilities
│   │   ├── geocoding/              # Nominatim integration
│   │   ├── styles/                 # 11 map styles
│   │   ├── supabase/               # Database client
│   │   └── utils.ts                # Utility functions
│   └── types/
│       └── poster.ts               # Type definitions
├── .mcp.json                       # MCP server config
├── README.md                       # Project specification
├── claude.md                       # This file
├── design.md                       # Design guide
└── STATUS.md                       # Implementation status
```

## Core Types

### PosterLocation
```typescript
interface PosterLocation {
  name: string;
  subtitle?: string;
  center: [number, number]; // [lng, lat]
  bounds: [[number, number], [number, number]]; // SW, NE corners
  zoom: number;
}
```

### PosterStyle
```typescript
interface PosterStyle {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  mapStyle: MapLibreStyle; // Full MapLibre style spec
  defaultPalette: ColorPalette;
  palettes: ColorPalette[];
  recommendedFonts: string[];
  layerToggles: LayerToggle[];
}
```

### ColorPalette
```typescript
interface ColorPalette {
  id: string;
  name: string;
  background: string;
  primary: string;
  secondary: string;
  water: string;
  greenSpace: string;
  text: string;
}
```

### PosterConfig
```typescript
interface PosterConfig {
  location: PosterLocation;
  style: PosterStyle;
  palette: ColorPalette;
  typography: {
    titleFont: string;
    titleSize: number;
    titleWeight: number;
    subtitleFont: string;
    subtitleSize: number;
    position: 'top' | 'bottom' | 'center';
    letterSpacing: number;
    allCaps: boolean;
  };
  format: {
    aspectRatio: string;
    orientation: 'portrait' | 'landscape';
    margin: number;
  };
  layers: {
    streets: boolean;
    buildings: boolean;
    water: boolean;
    parks: boolean;
    terrain: boolean;
    labels: boolean;
    marker: boolean;
  };
  camera?: {
    pitch: number;
    bearing: number;
  };
}
```

## Style Library (11 Styles Implemented)

1. **Minimal Line Art** - Streets only, monochromatic, clean
2. **Dark Mode/Noir** - Dark backgrounds, luminous streets
3. **Midnight Noir** - Deep night aesthetics
4. **Blueprint/Technical** - Cyan lines on blue, architectural
5. **Vintage/Antique** - Parchment and sepia tones
6. **Topographic/Contour** - Elevation contours, terrain-focused
7. **Watercolor/Painted** - Soft edges, color washes, organic
8. **Abstract/Artistic** - Stylized, expressive interpretation
9. **Atmospheric/Ethereal** - Misty, dreamy feel
10. **Organic/Nature** - Natural color palettes
11. **Retro/Nostalgic** - Vintage color schemes

Each style includes:
- Custom MapLibre style definition
- Multiple color palette presets (40+ total palettes)
- Recommended font pairings
- Layer toggle configurations

## UI Design - Minimalist Approach

### Design Principles
- **Compact controls** - Smaller text (text-xs, text-[10px], text-[11px])
- **Subtle colors** - Gray-400/500 for secondary elements
- **Icon-only navigation** - Clean sidebar with tooltip labels
- **Collapsible sections** - Chevron-based expand/collapse
- **Consistent spacing** - Tight but breathable layout
- **No unnecessary decoration** - Focus on content

### Navigation Structure
- **Sidebar (left)**: Icon-only navigation
  - Logo (home link)
  - AI Creator (sparkles icon)
  - Library (grid icon)
  - Design (sliders icon)
  - Account (user icon - bottom)
- **Consistent across all pages** - Main editor and AI page share same navigation

### Control Panel Tabs
- **Library**: Examples gallery + Saved projects
- **Design**: Location, Style & Colors, Text & Labels, Format & Frame
- **Account**: User info, navigation links, publish controls

## Key Technical Considerations

### Map Rendering
- Use MapLibre GL JS (open-source, no API key for basic usage)
- Style definitions follow MapLibre style spec
- Use style expressions for dynamic color swapping
- Enable `preserveDrawingBuffer: true` for canvas export

### Tile Sources
- **OpenFreeMap**: Free, no API key, OpenMapTiles schema

### Export Strategy
- Render map at higher resolution than screen display
- Composite map canvas with text overlays using Canvas API
- Target sizes: up to 36x48 inches at 300 DPI (10800x14400 pixels)
- Multiple resolution presets available

### State Management
- URL-based state for shareability
- Supabase for persistence
- Custom React hooks for app state

### Performance
- Debounce style updates during customization
- Show loading states for large exports
- Warn users about export time for very large sizes

## Coding Conventions

- Use TypeScript strictly - no `any` types without justification
- Follow Next.js App Router conventions
- Use Tailwind CSS utilities over custom CSS
- Component files: PascalCase (e.g., `MapPreview.tsx`)
- Utility files: camelCase (e.g., `exportCanvas.ts`)
- Keep components focused and composable
- Extract complex logic to custom hooks
- Use server components by default, client components only when needed

## Common Tasks

### Adding a New Style
1. Create MapLibre style JSON in `lib/styles/`
2. Define default color palettes
3. Add style metadata (name, description, thumbnail)
4. Register in style library index

### Adding a New Color Palette
1. Define ColorPalette object
2. Add to appropriate style's palettes array
3. Ensure all required colors are specified

### Modifying Export Resolution
1. Update export constants in `lib/export/constants.ts`
2. Adjust canvas rendering logic
3. Update UI to reflect new options

## Important Notes

- **No API keys required for MVP** - Use OpenFreeMap for tiles
- **Export is client-side** - All rendering happens in browser
- **Font embedding** - Ensure fonts are loaded before export
- **Color values** - Use hex format for consistency
- **Coordinates** - Always [longitude, latitude] order

## External Resources

- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/)
- [OpenFreeMap](https://openfreemap.org/)
- [Nominatim Geocoding API](https://nominatim.org/release-docs/develop/api/Search/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)

## Current Status

**Phase**: Production-ready
**Location**: All implementation in `frontend/` directory
**Dev Server**: http://localhost:3000

### What's Working
- 11 map styles with 40+ color palettes
- Real-time preview with pan/zoom
- Location search with Nominatim
- Full typography controls
- Layer visibility toggles
- Aspect ratio and format options
- PNG export at multiple resolutions (up to 10800x14400px)
- AI-powered map generation from natural language
- Supabase integration for auth and data
- Community features (feed, comments, profiles)
- Minimalist UI design with consistent navigation

---

**For detailed status**, see STATUS.md
**For full project context**, see README.md
**For design guidelines**, see design.md
