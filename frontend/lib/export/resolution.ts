import type { PosterConfig } from '@/types/poster';
import { ASPECT_RATIOS } from '../styles/dimensions';

export interface ExportResolution {
  width: number;
  height: number;
  dpi: number;
  name: string;
}

export function calculateTargetResolution(
  baseResolution: ExportResolution,
  aspectRatio: PosterConfig['format']['aspectRatio'],
  orientation: 'portrait' | 'landscape'
): ExportResolution {
  const ratio = ASPECT_RATIOS[aspectRatio] || 1;
  
  let targetWidth = baseResolution.width;
  let targetHeight = baseResolution.height;

  if (orientation === 'portrait') {
    // Width is determined by ratio, height is fixed to resolution.height
    targetHeight = baseResolution.height;
    targetWidth = Math.round(targetHeight * ratio);
  } else {
    // Landscape: swap roles. Width is fixed to resolution.height (the long side), 
    // height is determined by ratio.
    targetWidth = baseResolution.height;
    targetHeight = Math.round(targetWidth * ratio);
  }

  return {
    ...baseResolution,
    width: targetWidth,
    height: targetHeight
  };
}

