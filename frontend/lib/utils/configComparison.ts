import type { PosterConfig } from '@/types/poster';

/**
 * Deep clones a PosterConfig object using the most efficient method available.
 * Prefers structuredClone (native browser API) for better performance and type safety,
 * falls back to JSON parse/stringify for older environments.
 * 
 * @param config - PosterConfig object to clone
 * @returns Deep clone of the config object
 * 
 * @example
 * ```ts
 * const cloned = cloneConfig(currentConfig);
 * // Modify cloned without affecting original
 * ```
 */
export function cloneConfig(config: PosterConfig): PosterConfig {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(config);
  }
  return JSON.parse(JSON.stringify(config));
}

/**
 * Efficiently compares two PosterConfig objects for equality.
 * Uses shallow comparison for frequently-changing properties (location, typography, format)
 * to optimize performance, then falls back to deep comparison if needed.
 * 
 * @param a - First config to compare
 * @param b - Second config to compare
 * @returns true if configs are equal, false otherwise
 * 
 * @example
 * ```ts
 * if (!isConfigEqual(oldConfig, newConfig)) {
 *   // Config changed, update history
 * }
 * ```
 */
export function isConfigEqual(a: PosterConfig, b: PosterConfig): boolean {
  // Reference equality check
  if (a === b) return true;

  // Quick checks on frequently changing properties
  // Location changes are the most common
  if (
    a.location.center[0] !== b.location.center[0] ||
    a.location.center[1] !== b.location.center[1] ||
    a.location.zoom !== b.location.zoom ||
    a.location.name !== b.location.name
  ) {
    return false;
  }

  // Style and palette IDs (these are less likely to change frequently)
  if (a.style.id !== b.style.id || a.palette.id !== b.palette.id) {
    return false;
  }

  // Typography quick checks
  if (
    a.typography.titleFont !== b.typography.titleFont ||
    a.typography.titleSize !== b.typography.titleSize ||
    a.typography.subtitleFont !== b.typography.subtitleFont ||
    a.typography.subtitleSize !== b.typography.subtitleSize
  ) {
    return false;
  }

  // Format quick checks
  if (
    a.format.aspectRatio !== b.format.aspectRatio ||
    a.format.orientation !== b.format.orientation ||
    a.format.margin !== b.format.margin ||
    a.format.borderStyle !== b.format.borderStyle
  ) {
    return false;
  }

  // If shallow comparison passes, do deep comparison for safety
  // This is still more efficient than always doing deep comparison
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    // If stringification fails, assume not equal
    return false;
  }
}

