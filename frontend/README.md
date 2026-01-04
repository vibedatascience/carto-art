# Map Poster Generator - Frontend

This is the frontend application for the Map Poster Generator, built with Next.js 16.1.1 and React.

## Environment Variables

Create a `.env.local` file in this directory with the following variables:

```bash
# Supabase (required for auth and data persistence)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API (required for AI Creator feature)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Google Analytics (optional - leave empty to disable analytics)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Nominatim geocoding (optional, defaults work for development)
# User-Agent header for Nominatim API requests
# Format: "app-name (contact-url-or-email)"
NOMINATIM_USER_AGENT=carto-art (https://yourdomain.com)

# From email header for Nominatim API requests
NOMINATIM_FROM_EMAIL=you@yourdomain.com
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Build

```bash
npm run build
```

## Project Structure

```
frontend/
├── app/                     # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── ai/generate/     # AI generation endpoint
│   │   ├── geocode/         # Geocoding proxy
│   │   ├── publish/         # Map publishing
│   │   └── tiles/           # Tile proxy
│   ├── ai/                  # AI Creator page
│   ├── feed/                # Community feed
│   ├── login/               # Authentication
│   ├── map/[id]/            # Shared map view
│   └── profile/             # User profile
├── components/
│   ├── auth/                # Auth components
│   ├── comments/            # Comment system
│   ├── controls/            # Editor control panels
│   ├── layout/              # Layout components
│   ├── map/                 # Map rendering components
│   ├── profile/             # Profile components
│   └── ui/                  # Shared UI components
├── hooks/
│   ├── useMapExport.ts      # Export functionality
│   └── usePosterConfig.ts   # State management
├── lib/
│   ├── actions/             # Server actions
│   ├── ai/                  # AI configuration
│   ├── export/              # Export utilities
│   ├── geocoding/           # Nominatim integration
│   ├── styles/              # 11 map style definitions
│   └── supabase/            # Database client
└── types/
    └── poster.ts            # TypeScript type definitions
```

## Features

- 11 map styles with 40+ color palettes
- Real-time map preview with MapLibre GL JS
- High-resolution PNG export (up to 10800x14400px)
- AI-powered map generation
- User authentication via Supabase
- Community feed with publishing and comments

## Tech Stack

- Next.js 16.1.1 with App Router
- TypeScript
- Tailwind CSS 4.x
- MapLibre GL JS 4.7.1
- React Map GL 7.1.9
- Supabase for auth and database
