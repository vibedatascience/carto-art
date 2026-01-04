# Map Poster Generator

A web application that generates beautifully stylized map posters from real geographic data. Users select a location, choose an artistic style, customize colors and typography, then export high-resolution images suitable for large-format printing.

Think of it as a cartographic art tool - turning real OpenStreetMap/terrain data into gallery-worthy prints.

## Gallery

| ![Chesapeake Bay](frontend/public/examples/chesapeke-poster.png) | ![Denver](frontend/public/examples/denver-poster.png) |
|:---:|:---:|
| **Chesapeake Bay** | **Denver** |
| ![DMV](frontend/public/examples/dmv-poster.png) | ![Salt Lake City](frontend/public/examples/salt-lake-city-poster.png) |
| **DMV Area** | **Salt Lake City** |
| ![Hawaii](frontend/public/examples/hawaii-poster.png) | ![Reggio Calabria](frontend/public/examples/reggio-calabria-poster.png) |
| **Hawaii** | **Reggio Calabria** |
| ![Washington DC Artistic](frontend/public/examples/washington-artistic-poster.png) | ![Washington DC Artistic 2](frontend/public/examples/washington-artistic-poster-2.png) |
| **Washington DC (Artistic)** | **Washington DC (Artistic 2)** |

---

## Features

### Map Styles (11 implemented)
- **Minimal Line Art** - Clean, monochromatic streets
- **Dark Mode/Noir** - Dramatic dark backgrounds with luminous streets
- **Midnight Noir** - Deep night aesthetics
- **Blueprint/Technical** - Cyan lines on blue, architectural feel
- **Vintage/Antique** - Parchment and sepia tones
- **Topographic/Contour** - Elevation-focused with contour styling
- **Watercolor/Painted** - Soft, artistic washes
- **Abstract/Artistic** - Stylized interpretation
- **Atmospheric/Ethereal** - Misty, dreamy feel
- **Organic/Nature** - Natural color palettes
- **Retro/Nostalgic** - Vintage color schemes

### Customization Options
- **40+ color palettes** across all styles
- **Typography controls** - fonts, sizes, weights, letter spacing, all-caps
- **Layer toggles** - streets, buildings, water, parks, labels, terrain, marker
- **Format options** - 5 aspect ratios, portrait/landscape, margins
- **Text overlays** with backdrop options (subtle, strong, gradient)
- **3D terrain and building extrusion**

### Export
- PNG export at multiple print resolutions:
  - Preview (1080p)
  - Small: 3600x5400px (12x18" @ 300 DPI)
  - Medium: 5400x7200px (18x24" @ 300 DPI)
  - Large: 7200x10800px (24x36" @ 300 DPI)
  - X-Large: 9000x12000px (30x40" @ 300 DPI)
  - XX-Large: 10800x14400px (36x48" @ 300 DPI)

### AI Creator
- Natural language map generation ("Create a vintage-style poster of Paris")
- Chat-based interface with streaming responses
- Interactive config editor for fine-tuning

### Social Features
- Publish maps to community feed
- Browse and discover maps from other users
- User profiles with map galleries
- Comments on published maps
- Share links for maps

---

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Map Rendering**: MapLibre GL JS 4.7.1 with React Map GL 7.1.9
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API
- **Tiles**: OpenFreeMap (free, no API key required)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API (for AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Nominatim geocoding (optional, defaults work for development)
NOMINATIM_USER_AGENT=carto-art (https://yourdomain.com)
NOMINATIM_FROM_EMAIL=you@yourdomain.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

---

## Core User Flow

1. **Search/Select Location** - Enter a place name or coordinates
2. **Adjust Bounds** - Pan/zoom to frame exactly what you want
3. **Choose Style** - Select from 11 artistic styles
4. **Customize** - Tweak colors, toggle layers, adjust typography
5. **Preview** - See the poster as it will appear with text overlay
6. **Export** - Download high-DPI image ready for printing

---

## Project Structure

```
carto-art/
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   │   ├── styles/          # 11 map style definitions
│   │   └── supabase/        # Database client
│   └── types/               # TypeScript type definitions
├── claude.md                # Development context
├── design.md                # Design guidelines
├── readme.md                # This file
└── STATUS.md                # Implementation status
```

---

## Documentation

- **STATUS.md** - Current implementation status
- **claude.md** - Development context and technical details
- **design.md** - Design guidelines for colors, typography, and composition

---

## License

MIT
