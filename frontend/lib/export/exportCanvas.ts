import type MapLibreGL from 'maplibre-gl';
import type { PosterConfig } from '@/types/poster';
import { DEFAULT_EXPORT_RESOLUTION } from './constants';
import { formatCoordinates, hexToRgba } from '../utils';
import { getScrimAlpha, calculateScrimHeight, getBackdropGradientStyles } from '../styles/backdrop';

interface ExportOptions {
  map: MapLibreGL.Map;
  config: PosterConfig;
  resolution?: {
    width: number;
    height: number;
    dpi: number;
    name: string;
  };
}

export async function exportMapToPNG(options: ExportOptions): Promise<Blob> {
  const { map, config, resolution = DEFAULT_EXPORT_RESOLUTION } = options;

  // 0. CALCULATE ACTUAL RESOLUTION BASED ON ASPECT RATIO & ORIENTATION
  const { aspectRatio, orientation } = config.format;
  
  // Get base dimensions from the resolution preset
  // We'll use the height of the preset as our "long side" reference if it's portrait
  // and the width as our "long side" reference if it's landscape.
  // Actually, let's just use the width and calculate height based on ratio.
  
  let targetWidth = resolution.width;
  let targetHeight = resolution.height;

  function getRatio(ratioStr: string): number {
    if (ratioStr === 'ISO') return 1 / Math.sqrt(2);
    const [w, h] = ratioStr.split(':').map(Number);
    return w / h;
  }

  const ratio = getRatio(aspectRatio);
  
  if (orientation === 'portrait') {
    // Width is determined by ratio, height is fixed to resolution.height
    targetHeight = resolution.height;
    targetWidth = Math.round(targetHeight * ratio);
  } else {
    // Landscape: swap roles. Width is fixed to resolution.height (the long side), 
    // height is determined by ratio.
    targetWidth = resolution.height;
    targetHeight = Math.round(targetWidth * ratio);
  }

  const exportResolution = {
    ...resolution,
    width: targetWidth,
    height: targetHeight
  };

  // Wait for fonts to be ready before drawing anything
  try {
    const fontsToLoad = [
      `${config.typography.titleWeight} 10px "${config.typography.titleFont}"`,
      `400 10px "${config.typography.subtitleFont}"`
    ];
    await Promise.all(fontsToLoad.map(font => document.fonts.load(font)));
  } catch (e) {
    console.warn('Failed to load fonts for export, falling back to system fonts:', e);
  }

  // 1. GATHER ACTUAL DIMENSIONS & SCALING
  // We need the logical size of the map container as seen on screen to calculate correct scaling
  const container = map.getContainer();
  // We find the parent of the map container which is the poster container in PosterEditor.tsx
  const posterElement = container.closest('[style*="aspect-ratio"]');
  const rect = (posterElement || container).getBoundingClientRect();
  const logicalWidth = rect.width;
  const logicalHeight = rect.height;

  // The total scale factor from what the user sees (CSS) to the export (PNG)
  const exportScale = exportResolution.width / logicalWidth;
  
  // Account for display scaling (DPR) to ensure map features are scaled correctly
  const dpr = window.devicePixelRatio || 1;
  const featureScale = exportResolution.width / (logicalWidth * dpr);
  const zoomOffset = Math.log2(featureScale);

  // Store original map dimensions and zoom
  const originalWidth = map.getCanvas().width;
  const originalHeight = map.getCanvas().height;
  const originalZoom = map.getZoom();

  try {
    // 2. CALCULATE EXACT DIMENSIONS (Matching CSS behavior)
    // In CSS, padding % is relative to the WIDTH of the container
    // We round to integer pixels to avoid sub-pixel gaps/overflows
    const marginPx = Math.round(exportResolution.width * (config.format.margin / 100));
    const drawWidth = exportResolution.width - (marginPx * 2);
    const drawHeight = exportResolution.height - (marginPx * 2);

    // 3. APPLY HIGH-RES SCALING TO MAP
    // We increase the zoom to scale up features (roads/labels) 
    // and resize the canvas simultaneously so the bounds stay the same.
    map.setZoom(originalZoom + zoomOffset);
    map.getCanvas().width = drawWidth;
    map.getCanvas().height = drawHeight;
    map.resize();

    // Wait for map to render at new size and high-res tiles
    await new Promise<void>(resolve => {
      map.once('idle', resolve);
    });

    // Get map canvas (WebGL canvas)
    const mapCanvas = map.getCanvas();

    // Create offscreen canvas for final composition
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportResolution.width;
    exportCanvas.height = exportResolution.height;
    const exportCtx = exportCanvas.getContext('2d');
    
    if (!exportCtx) {
      throw new Error('Could not create export canvas context');
    }

    // Draw background color first (filling the whole canvas)
    exportCtx.fillStyle = config.palette.background;
    exportCtx.fillRect(0, 0, exportResolution.width, exportResolution.height);

    // 4. DRAW MAP WITH CLIPPING
    // This prevents map lines/artifacts from "going past the border"
    exportCtx.save();
    exportCtx.beginPath();
    exportCtx.rect(marginPx, marginPx, drawWidth, drawHeight);
    exportCtx.clip();
    exportCtx.drawImage(mapCanvas, marginPx, marginPx, drawWidth, drawHeight);
    exportCtx.restore();

    // 5. DRAW LOCATION MARKER
    if (config.layers.marker) {
      // For a pin, the coordinate (markerX, markerY) corresponds to the TIP of the pin.
      // The shape grows UPWARDS from there.
      const markerX = marginPx + drawWidth / 2;
      const markerY = marginPx + drawHeight / 2;
      
      const markerSize = exportResolution.width * 0.045; // ~4.5% of width
      
      exportCtx.save();
      
      // Shadow
      exportCtx.shadowColor = 'rgba(0,0,0,0.3)';
      exportCtx.shadowBlur = markerSize * 0.15;
      exportCtx.shadowOffsetY = markerSize * 0.1;
      
      const scale = markerSize / 24; 
      
      exportCtx.translate(markerX, markerY);
      exportCtx.scale(scale, scale);
      // Move up so (0,0) is at the tip bottom (26 is roughly the bottom of the pin in SVG space)
      exportCtx.translate(0, -26); 

      // Draw Pin Shape helper
      const drawPinPath = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        const r = 10;
        const cy = 10;
        const tipY = 26;
        
        ctx.moveTo(0, tipY);
        ctx.bezierCurveTo(-1, 20, -r, 16, -r, cy);
        ctx.arc(0, cy, r, Math.PI, 0); 
        ctx.bezierCurveTo(r, 16, 1, 20, 0, tipY);
        ctx.closePath();
      };

      // 1. Draw Border (White)
      exportCtx.fillStyle = '#FFFFFF';
      drawPinPath(exportCtx);
      exportCtx.fill();
      
      // 2. Draw Inner Color
      exportCtx.fillStyle = config.palette.primary;
      exportCtx.strokeStyle = '#FFFFFF';
      exportCtx.lineWidth = 2.5;
      exportCtx.lineJoin = 'round';
      
      drawPinPath(exportCtx);
      exportCtx.fill();
      exportCtx.stroke();
      
      // 3. Draw Center Dot
      exportCtx.fillStyle = '#FFFFFF';
      exportCtx.beginPath();
      exportCtx.arc(0, 10, 3.5, 0, Math.PI * 2);
      exportCtx.fill();

      exportCtx.restore();
    }

    // 6. ADD TEXT OVERLAY
    const { typography, location } = config;
    
    exportCtx.fillStyle = config.palette.text;
    exportCtx.textAlign = 'center';
    exportCtx.textBaseline = 'middle';

    const rawTitleText = String(location.name || 'WHERE WE MET');
    const titleText = typography.titleAllCaps !== false ? rawTitleText.toUpperCase() : rawTitleText;
    const subtitleText = String(location.city || 'LONDON').toUpperCase();
    const coordsText = formatCoordinates(location.center);

    const showTitle = typography.showTitle !== false;
    const showSubtitle = typography.showSubtitle !== false && !!subtitleText;
    const showCoords = typography.showCoordinates !== false;

    // Use exact exportScale derived from logical dimensions
    // Typography sizes are now in cqw (percentage of width)
    const titleSizePx = Math.round(exportResolution.width * (typography.titleSize / 100));
    const subtitleSizePx = Math.round(exportResolution.width * (typography.subtitleSize / 100));
    const coordsSizePx = Math.round(subtitleSizePx * 0.65);

    // Backdrop calculations to match TextOverlay.tsx
    const backdropType = typography.textBackdrop || 'gradient';
    const scrimAlpha = getScrimAlpha(typography);
    const scrimHeight = calculateScrimHeight(config, true, exportScale, exportResolution.height) as number;
    
    if (backdropType !== 'none') {
      const isGradient = backdropType === 'gradient';
      
      exportCtx.save();
      if (typography.position === 'center' && !isGradient) {
        const yCenter = exportResolution.height / 2;
        const yTop = Math.max(0, Math.round(yCenter - scrimHeight / 2));
        exportCtx.globalAlpha = 1.0;
        exportCtx.fillStyle = hexToRgba(config.palette.background, backdropType === 'strong' ? 0.95 : 0.78);
        
        const radius = Math.round(scrimHeight * 0.2);
        exportCtx.font = `${typography.titleWeight} ${titleSizePx}px ${typography.titleFont}`;
        const titleTextFormatted = typography.titleAllCaps !== false ? String(location.name || 'WHERE WE MET').toUpperCase() : String(location.name || 'WHERE WE MET');
        const titleWidth = exportCtx.measureText(titleTextFormatted).width;
        // Adjust rect width based on what's visible
        let maxTextWidth = 0;
        if (showTitle) maxTextWidth = titleWidth;
        if (showSubtitle) {
          exportCtx.font = `${subtitleSizePx}px ${typography.subtitleFont}`;
          const subWidth = exportCtx.measureText(subtitleText).width + (subtitleText.length - 1) * 0.2 * subtitleSizePx + (exportResolution.width * 0.16); // text + lines + gap
          maxTextWidth = Math.max(maxTextWidth, subWidth);
        }
        if (showCoords) {
          exportCtx.font = `${coordsSizePx}px ${typography.subtitleFont}`;
          maxTextWidth = Math.max(maxTextWidth, exportCtx.measureText(coordsText).width);
        }

        const rectWidth = Math.min(exportResolution.width * 0.9, maxTextWidth * 1.2 + 40);
        const xLeft = (exportResolution.width - rectWidth) / 2;
        
        exportCtx.beginPath();
        exportCtx.roundRect(xLeft, yTop, rectWidth, scrimHeight, radius);
        exportCtx.fill();
        if (backdropType === 'strong') {
          exportCtx.shadowColor = 'rgba(0,0,0,0.1)';
          exportCtx.shadowBlur = 25 * exportScale;
          exportCtx.shadowOffsetY = 10 * exportScale;
          exportCtx.stroke();
        }
      } else {
        const isTop = typography.position === 'top';
        const yTop = isTop ? 0 : exportResolution.height - scrimHeight;
        const gradient = exportCtx.createLinearGradient(0, yTop, 0, yTop + scrimHeight);
        
        const gradientDef = getBackdropGradientStyles(config, scrimAlpha);
        if (gradientDef) {
          const bg = config.palette.background;
          gradientDef.stops.forEach(stop => {
            gradient.addColorStop(stop.pos, hexToRgba(bg, stop.alpha));
          });
        }
        
        exportCtx.globalAlpha = 1;
        exportCtx.fillStyle = gradient;
        exportCtx.fillRect(0, yTop, exportResolution.width, scrimHeight);
      }
      exportCtx.restore();
    }

    let titleY: number;
    let subtitleY: number;
    let coordsY: number;

    // Use exportResolution.width for vertical offsets to match CSS % padding behavior (where padding-top % is based on width)
    const marginPercent = config.format.margin;
    
    // Calculate total height for vertical centering if needed
    const spacingTitleSub = titleSizePx * 1.1;
    const spacingSubCoords = subtitleSizePx * 1.4;
    
    let totalTextHeight = 0;
    if (showTitle) totalTextHeight += titleSizePx;
    if (showSubtitle) {
      if (showTitle) totalTextHeight += spacingTitleSub;
      else totalTextHeight += subtitleSizePx;
    }
    if (showCoords) {
      if (showSubtitle) totalTextHeight += spacingSubCoords;
      else if (showTitle) totalTextHeight += (titleSizePx * 1.1 + subtitleSizePx * 1.4) / 2; // approximation
      else totalTextHeight += coordsSizePx;
    }

    if (typography.position === 'top') {
      let currentY = exportResolution.width * ((marginPercent + 3) / 100);
      if (showTitle) {
        titleY = currentY + titleSizePx / 2;
        currentY = titleY + titleSizePx * 0.6;
      } else titleY = -1000;

      if (showSubtitle) {
        if (showTitle) currentY += titleSizePx * 0.5;
        subtitleY = currentY + subtitleSizePx / 2;
        currentY = subtitleY + subtitleSizePx * 0.7;
      } else subtitleY = -1000;

      if (showCoords) {
        if (showSubtitle) currentY += subtitleSizePx * 0.7;
        else if (showTitle) currentY += titleSizePx * 0.5;
        coordsY = currentY + coordsSizePx / 2;
      } else coordsY = -1000;

    } else if (typography.position === 'bottom') {
      let currentY = exportResolution.height - (exportResolution.width * ((marginPercent + 5) / 100));
      if (showCoords) {
        coordsY = currentY - coordsSizePx / 2;
        currentY = coordsY - coordsSizePx * 0.7;
      } else coordsY = -1000;

      if (showSubtitle) {
        if (showCoords) currentY -= subtitleSizePx * 0.7;
        subtitleY = currentY - subtitleSizePx / 2;
        currentY = subtitleY - subtitleSizePx * 0.6;
      } else subtitleY = -1000;

      if (showTitle) {
        if (showSubtitle) currentY -= subtitleSizePx * 0.6;
        else if (showCoords) currentY -= coordsSizePx * 0.7;
        titleY = currentY - titleSizePx / 2;
      } else titleY = -1000;

    } else {
      // Center positioning
      const startY = (exportResolution.height - totalTextHeight) / 2;
      let currentY = startY;

      if (showTitle) {
        titleY = currentY + titleSizePx / 2;
        currentY += spacingTitleSub;
      } else titleY = -1000;

      if (showSubtitle) {
        subtitleY = currentY + subtitleSizePx / 2;
        currentY += spacingSubCoords;
      } else subtitleY = -1000;

      if (showCoords) {
        coordsY = currentY + coordsSizePx / 2;
      } else coordsY = -1000;
    }

    // Drawing helper
    const drawTextWithHalo = (text: string, x: number, y: number, fontSizePxLocal: number, weight: number | string = 400, opacity: number = 1, letterSpacing: number = 0, fontFamily: string = typography.titleFont) => {
      if (y < -500) return; // Skip if hidden
      exportCtx.save();
      exportCtx.font = `${weight} ${fontSizePxLocal}px "${fontFamily}"`;
      exportCtx.globalAlpha = opacity;
      
      const outlinePx = Math.max(2, Math.min(8, Math.round(fontSizePxLocal * 0.12)));
      
      if (backdropType !== 'gradient') {
        exportCtx.strokeStyle = config.palette.background;
        exportCtx.lineWidth = outlinePx;
        exportCtx.lineJoin = 'round';
        
        exportCtx.shadowColor = 'rgba(0,0,0,0.14)';
        exportCtx.shadowBlur = Math.max(6, Math.round(outlinePx * 4));
        exportCtx.shadowOffsetY = Math.max(2, Math.round(outlinePx * 1.2));
        
        if (letterSpacing) {
          const tracking = letterSpacing * fontSizePxLocal;
          let currentX = x - (exportCtx.measureText(text).width + (text.length - 1) * tracking) / 2;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = exportCtx.measureText(char).width;
            exportCtx.strokeText(char, currentX + charWidth / 2, y);
            currentX += charWidth + tracking;
          }
        } else {
          exportCtx.strokeText(text, x, y);
        }
      }

      exportCtx.shadowColor = 'transparent';
      if (letterSpacing) {
        const tracking = letterSpacing * fontSizePxLocal;
        let currentX = x - (exportCtx.measureText(text).width + (text.length - 1) * tracking) / 2;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const charWidth = exportCtx.measureText(char).width;
          exportCtx.fillText(char, currentX + charWidth / 2, y);
          currentX += charWidth + tracking;
        }
      } else {
        exportCtx.fillText(text, x, y);
      }
      exportCtx.restore();
    };

    // Draw Title
    if (showTitle) {
      drawTextWithHalo(
        titleText, 
        exportResolution.width / 2, 
        titleY, 
        titleSizePx, 
        typography.titleWeight, 
        1, 
        typography.titleLetterSpacing || 0
      );
    }

    // Draw Subtitle with lines
    if (showSubtitle) {
      const tracking = 0.2;
      exportCtx.font = `${subtitleSizePx}px ${typography.subtitleFont}`;
      const textWidth = exportCtx.measureText(subtitleText).width + (subtitleText.length - 1) * tracking * subtitleSizePx;
      const lineWidth = exportResolution.width * 0.06;
      const lineGap = exportResolution.width * 0.02;
      
      exportCtx.save();
      exportCtx.strokeStyle = config.palette.text;
      exportCtx.lineWidth = Math.max(1, Math.round(exportScale * 1.5));
      exportCtx.globalAlpha = 0.4;
      
      const lineY = subtitleY;
      exportCtx.beginPath();
      exportCtx.moveTo(exportResolution.width / 2 - textWidth / 2 - lineGap - lineWidth, lineY);
      exportCtx.lineTo(exportResolution.width / 2 - textWidth / 2 - lineGap, lineY);
      exportCtx.stroke();
      
      exportCtx.beginPath();
      exportCtx.moveTo(exportResolution.width / 2 + textWidth / 2 + lineGap, lineY);
      exportCtx.lineTo(exportResolution.width / 2 + textWidth / 2 + lineGap + lineWidth, lineY);
      exportCtx.stroke();
      exportCtx.restore();

      drawTextWithHalo(
        subtitleText, 
        exportResolution.width / 2, 
        subtitleY, 
        subtitleSizePx, 
        400, 
        0.9, 
        tracking,
        typography.subtitleFont
      );
    }

    // Draw Coordinates
    if (showCoords) {
      drawTextWithHalo(
        coordsText, 
        exportResolution.width / 2, 
        coordsY, 
        coordsSizePx, 
        400, 
        0.6, 
        0.1,
        typography.subtitleFont
      );
    }

    // 7. ADD BORDER (Now after text and backdrop to avoid being washed out)
    if (config.format.borderStyle !== 'none') {
      exportCtx.save();
      exportCtx.strokeStyle = config.palette.accent || config.palette.text;
      exportCtx.lineWidth = exportResolution.width * 0.005; // 0.5% of width
      
      switch (config.format.borderStyle) {
        case 'thin':
          exportCtx.strokeRect(marginPx, marginPx, drawWidth, drawHeight);
          break;
        case 'thick':
          exportCtx.lineWidth = exportResolution.width * 0.015;
          exportCtx.strokeRect(marginPx, marginPx, drawWidth, drawHeight);
          break;
        case 'inset':
          // Inset border is slightly inside the margin
          const inset = exportResolution.width * 0.02;
          exportCtx.strokeRect(marginPx + inset, marginPx + inset, drawWidth - (inset * 2), drawHeight - (inset * 2));
          break;
      }
      exportCtx.restore();
    }

    // 8. FINAL POLISH (Media Texture)
    const { texture, textureIntensity = 20 } = config.format;
    if (texture && texture !== 'none') {
      const noiseCanvas = document.createElement('canvas');
      // Larger tile for high-res
      const tileSize = texture === 'grain' ? 128 : 256;
      noiseCanvas.width = tileSize;
      noiseCanvas.height = tileSize;
      const noiseCtx = noiseCanvas.getContext('2d');
      
      if (noiseCtx) {
        const idata = noiseCtx.createImageData(tileSize, tileSize);
        const buffer32 = new Uint32Array(idata.data.buffer);
        
        for (let i = 0; i < buffer32.length; i++) {
          const noise = Math.random() * 255;
          // Apply different "grain" profiles based on texture type
          // Paper and grain are similar but paper is more subtle, canvas has more contrast
          const alpha = (textureIntensity / 100) * 255 * (texture === 'canvas' ? 0.25 : 0.15);
          buffer32[i] = (Math.round(alpha) << 24) | (noise << 16) | (noise << 8) | noise;
        }
        
        noiseCtx.putImageData(idata, 0, 0);
        const pattern = exportCtx.createPattern(noiseCanvas, 'repeat');
        if (pattern) {
          exportCtx.save();
          exportCtx.globalCompositeOperation = 'multiply';
          exportCtx.fillStyle = pattern;
          exportCtx.fillRect(0, 0, exportResolution.width, exportResolution.height);
          exportCtx.restore();
        }
      }
    }

    // Convert to blob
    return new Promise<Blob>((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });
  } finally {
    // 9. RESTORE ORIGINAL MAP STATE
    map.setZoom(originalZoom);
    map.getCanvas().width = originalWidth;
    map.getCanvas().height = originalHeight;
    map.resize();
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

