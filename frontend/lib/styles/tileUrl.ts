const PROXY_BASE = '/api/tiles';

function joinBaseAndPath(base: string, path: string): string {
  // Important: don't use new URL(...).toString() for templates that include "{z}/{x}/{y}",
  // because URL stringification percent-encodes "{" and "}" (breaking MapLibre replacement).
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Returns an absolute TileJSON URL for the OpenFreeMap "planet" tileset.
 */
export function getOpenFreeMapPlanetTileJsonUrl(): string {
  const path = 'openfreemap/planet';
  
  const envBase = process.env.NEXT_PUBLIC_SERVER_URL;
  if (envBase) {
    return joinBaseAndPath(envBase, `${PROXY_BASE}/${path}`);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return joinBaseAndPath(window.location.origin, `${PROXY_BASE}/${path}`);
  }

  return `${PROXY_BASE}/${path}`;
}

/**
 * Returns the URL for contour/elevation tiles.
 * Supports MapTiler as the primary provider, proxied to avoid CORS issues.
 */
export function getContourTileJsonUrl(): string | null {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!maptilerKey) return null;

  const path = `maptiler/tiles/contours/tiles.json?key=${maptilerKey}`;
  
  const envBase = process.env.NEXT_PUBLIC_SERVER_URL;
  if (envBase) {
    return joinBaseAndPath(envBase, `${PROXY_BASE}/${path}`);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return joinBaseAndPath(window.location.origin, `${PROXY_BASE}/${path}`);
  }
  
  return `${PROXY_BASE}/${path}`;
}

/**
 * Returns the URL for Terrain-RGB tiles (elevation data).
 */
export function getTerrainRgbTileJsonUrl(): string | null {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!maptilerKey) return null;

  const path = `maptiler/tiles/terrain-rgb-v2/tiles.json?key=${maptilerKey}`;
  
  if (typeof window !== 'undefined' && window.location?.origin) {
    return joinBaseAndPath(window.location.origin, `${PROXY_BASE}/${path}`);
  }
  
  const envBase = process.env.NEXT_PUBLIC_SERVER_URL;
  if (envBase) {
    return joinBaseAndPath(envBase, `${PROXY_BASE}/${path}`);
  }

  return `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${maptilerKey}`;
}

/**
 * Returns the URL for Kontur population tiles, proxied to avoid CORS issues.
 */
export function getPopulationTileUrl(): string {
  const path = 'kontur/{z}/{x}/{y}.mvt?indicatorsClass=general';
  
  const envBase = process.env.NEXT_PUBLIC_SERVER_URL;
  if (envBase) {
    return joinBaseAndPath(envBase, `${PROXY_BASE}/${path}`);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return joinBaseAndPath(window.location.origin, `${PROXY_BASE}/${path}`);
  }

  // Fallback to relative path if no base URL is available
  return `${PROXY_BASE}/${path}`;
}


