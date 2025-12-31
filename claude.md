# Map Poster Generator - Development Context

## Project Summary

A web application that generates beautifully stylized map posters from real geographic data. Users select a location, choose an artistic style, customize colors and typography, then export high-resolution images suitable for large-format printing.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map Rendering**: MapLibre GL JS with React Map GL
- **Data Sources**: OpenStreetMap vector tiles, terrain/elevation data

## Project Structure

```
carto-art/
├── frontend/            # ✅ IMPLEMENTED
│   ├── app/
│   │   ├── api/tiles/[...path]/  # Tile proxy endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── controls/    # ✅ All 6 control components
│   │   │   ├── ColorControls.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── FormatControls.tsx
│   │   │   ├── LayerControls.tsx
│   │   │   ├── LocationSearch.tsx
│   │   │   ├── StyleSelector.tsx
│   │   │   └── TypographyControls.tsx
│   │   ├── layout/
│   │   │   └── PosterEditor.tsx  # Main editor
│   │   └── map/
│   │       ├── MapPreview.tsx
│   │       └── TextOverlay.tsx
│   ├── hooks/
│   │   ├── useMapExport.ts
│   │   └── usePosterConfig.ts
│   ├── lib/
│   │   ├── export/      # ✅ Canvas export logic
│   │   ├── geocoding/   # ✅ Nominatim integration
│   │   └── styles/      # ✅ 3 complete styles
│   │       ├── minimal.ts
│   │       ├── dark-mode.ts
│   │       ├── blueprint.ts
│   │       ├── applyPalette.ts
│   │       └── index.ts
│   ├── types/
│   │   └── poster.ts    # ✅ Complete type definitions
│   ├── components.json   # shadcn/ui config
│   └── package.json
├── .mcp.json            # MCP server config
├── README.md            # Project specification
├── claude.md            # This file
└── STATUS.md            # ✅ Implementation status
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
  };
}
```

## Development Phases

### Phase 1: Core MVP ✅ COMPLETE
- [x] Set up Next.js project with TypeScript and Tailwind
- [x] Integrate MapLibre GL JS with React
- [x] Implement location search with Nominatim API
- [x] Create 3 initial styles (Minimal, Dark Mode, Blueprint)
- [x] Build complete UI with all control panels
- [x] Implement text overlay system with full customization
- [x] Add PNG export functionality with high-res support
- [x] Typography customization (fonts, sizes, spacing, all-caps)
- [x] Layer toggles (streets, buildings, water, parks, labels, terrain, marker)
- [x] Format/aspect ratio options (5 ratios, portrait/landscape)
- [x] Multiple color palettes per style (15 total palettes)

**Current Task**: Testing and refinement

### Phase 2: Style Expansion (Future)
- [ ] Add remaining 5 styles (Topographic, Vintage, Watercolor, Isometric, Abstract)
- [ ] Add more color palettes
- [ ] Style-specific customizations

### Phase 3: High-Res Export
- [ ] Multi-resolution export options
- [ ] Progress indicator for large exports
- [ ] PDF export
- [ ] Tiled rendering for very large outputs

### Phase 4: Polish & Features
- [ ] Save/load poster configurations
- [ ] Share links (URL-based state)
- [ ] Gallery of examples
- [ ] Print partner integration (optional)

## Style Library

1. **Minimal Line Art** - Streets only, monochromatic, clean
2. **Topographic/Contour** - Elevation contours, terrain-focused
3. **Vintage/Antique** - Parchment, sepia tones, hand-drawn feel
4. **Blueprint/Technical** - Cyan lines on blue, architectural
5. **Watercolor/Painted** - Soft edges, color washes, organic
6. **Dark Mode/Noir** - Dark backgrounds, luminous streets
7. **Isometric/3D** - Buildings with height, diorama appearance
8. **Abstract/Artistic** - Stylized, expressive interpretation

## Key Technical Considerations

### Map Rendering
- Use MapLibre GL JS (open-source, no API key for basic usage)
- Style definitions follow MapLibre style spec
- Use style expressions for dynamic color swapping
- Enable `preserveDrawingBuffer: true` for canvas export

### Tile Sources
- **OpenFreeMap**: Free, no API key, OpenMapTiles schema
- **MapTiler**: Free tier with API key
- **Protomaps**: PMTiles format, can self-host

### Export Strategy
- Render map at higher resolution than screen display
- Composite map canvas with text overlays using Canvas API
- Target sizes: up to 24x36 inches at 300 DPI (7200x10800 pixels)
- Consider Web Workers for large export processing

### State Management
- Consider URL-based state for shareability
- Local storage for persistence
- React Context or Zustand for app state

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
1. Create MapLibre style JSON in `src/lib/styles/`
2. Define default color palettes
3. Add style metadata (name, description, thumbnail)
4. Register in style library index

### Adding a New Color Palette
1. Define ColorPalette object
2. Add to appropriate style's palettes array
3. Ensure all required colors are specified

### Modifying Export Resolution
1. Update export constants in `src/lib/export/constants.ts`
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

**Phase**: Phase 1 MVP - ✅ **COMPLETE** (Ready for Testing)
**Location**: All implementation in `frontend/` directory
**Dev Server**: Should be running on http://localhost:3000

### What's Working
- ✅ Complete UI with 6 control panels
- ✅ 3 map styles with 15 color palettes total
- ✅ Real-time preview with pan/zoom
- ✅ Location search with Nominatim
- ✅ Full typography controls
- ✅ Layer visibility toggles
- ✅ Aspect ratio and format options
- ✅ PNG export at multiple resolutions

### Next Steps
1. **Test in browser** - Verify all features work
2. **Test export** - Try exporting at different resolutions
3. **Bug fixes** - Address any issues found
4. **Enhancement** - Consider adding shadcn/ui components for polish

### Recent Implementation
- All Phase 1 features built in `frontend/` directory
- MapLibre styles with dynamic color swapping
- Canvas-based high-resolution export (up to 7200x10800px)
- Comprehensive state management via hooks
- Responsive UI with dark mode support

---

**For detailed status**, see STATUS.md
**For full project context**, see README.md
