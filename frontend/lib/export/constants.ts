// Export resolution constants

export const EXPORT_RESOLUTIONS = {
  PREVIEW: {
    name: 'Preview (1080p)',
    width: 1080,
    height: 1620,
    dpi: 72,
  },
  SMALL: {
    name: 'Small (12x18")',
    width: 3600,
    height: 5400,
    dpi: 300,
  },
  MEDIUM: {
    name: 'Medium (18x24")',
    width: 5400,
    height: 7200,
    dpi: 300,
  },
  LARGE: {
    name: 'Large (24x36")',
    width: 7200,
    height: 10800,
    dpi: 300,
  },
  XLARGE: {
    name: 'X-Large (30x40")',
    width: 9000,
    height: 12000,
    dpi: 300,
  },
  XXLARGE: {
    name: 'XX-Large (36x48")',
    width: 10800,
    height: 14400,
    dpi: 300,
  },
} as const;

export type ExportResolutionKey = keyof typeof EXPORT_RESOLUTIONS;
export type ExportResolution = typeof EXPORT_RESOLUTIONS[ExportResolutionKey];

// Default export resolution for MVP
export const DEFAULT_EXPORT_RESOLUTION = EXPORT_RESOLUTIONS.SMALL;












