import type { PosterConfig, ColorPalette } from '@/types/poster';
import { hexToRgba } from '../utils';

export function drawPin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = size * 0.15;
  ctx.shadowOffsetY = size * 0.1;
  
  const scale = size / 24; 
  
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Move up so (0,0) is at the tip bottom (26 is roughly the bottom of the pin in SVG space)
  ctx.translate(0, -26); 

  const drawPinPath = (c: CanvasRenderingContext2D) => {
    c.beginPath();
    const r = 10;
    const cy = 10;
    const tipY = 26;
    
    c.moveTo(0, tipY);
    c.bezierCurveTo(-1, 20, -r, 16, -r, cy);
    c.arc(0, cy, r, Math.PI, 0); 
    c.bezierCurveTo(r, 16, 1, 20, 0, tipY);
    c.closePath();
  };

  // 1. Draw Border (White)
  ctx.fillStyle = '#FFFFFF';
  drawPinPath(ctx);
  ctx.fill();
  
  // 2. Draw Inner Color
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  
  drawPinPath(ctx);
  ctx.fill();
  ctx.stroke();
  
  // 3. Draw Center Dot
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 10, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawTextWithHalo(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSizePx: number,
  options: {
    weight?: number | string;
    opacity?: number;
    letterSpacing?: number;
    fontFamily: string;
    haloColor: string;
    textColor: string;
    showHalo?: boolean;
    haloBlur?: number;
    haloOffsetY?: number;
  }
) {
  const {
    weight = 400,
    opacity = 1,
    letterSpacing = 0,
    fontFamily,
    haloColor,
    textColor,
    showHalo = true,
    haloBlur,
    haloOffsetY,
  } = options;

  ctx.save();
  ctx.font = `${weight} ${fontSizePx}px "${fontFamily}"`;
  ctx.globalAlpha = opacity;
  
  const outlinePx = Math.max(2, Math.min(8, Math.round(fontSizePx * 0.12)));
  
  if (showHalo) {
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = outlinePx;
    ctx.lineJoin = 'round';
    
    ctx.shadowColor = 'rgba(0,0,0,0.14)';
    ctx.shadowBlur = haloBlur ?? Math.max(6, Math.round(outlinePx * 4));
    ctx.shadowOffsetY = haloOffsetY ?? Math.max(2, Math.round(outlinePx * 1.2));
    
    if (letterSpacing) {
      const tracking = letterSpacing * fontSizePx;
      const metrics = ctx.measureText(text);
      let currentX = x - (metrics.width + (text.length - 1) * tracking) / 2;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        ctx.strokeText(char, currentX + charWidth / 2, y);
        currentX += charWidth + tracking;
      }
    } else {
      ctx.strokeText(text, x, y);
    }
  }

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = textColor;
  if (letterSpacing) {
    const tracking = letterSpacing * fontSizePx;
    const metrics = ctx.measureText(text);
    let currentX = x - (metrics.width + (text.length - 1) * tracking) / 2;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = ctx.measureText(char).width;
      ctx.fillText(char, currentX + charWidth / 2, y);
      currentX += charWidth + tracking;
    }
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

export function applyTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: 'paper' | 'canvas' | 'grain',
  intensity: number
) {
  const noiseCanvas = document.createElement('canvas');
  const tileSize = type === 'grain' ? 128 : 256;
  noiseCanvas.width = tileSize;
  noiseCanvas.height = tileSize;
  const noiseCtx = noiseCanvas.getContext('2d');
  
  if (!noiseCtx) return;

  const idata = noiseCtx.createImageData(tileSize, tileSize);
  const buffer32 = new Uint32Array(idata.data.buffer);
  
  for (let i = 0; i < buffer32.length; i++) {
    const noise = Math.random() * 255;
    const alpha = (intensity / 100) * 255 * (type === 'canvas' ? 0.25 : 0.15);
    buffer32[i] = (Math.round(alpha) << 24) | (noise << 16) | (noise << 8) | noise;
  }
  
  noiseCtx.putImageData(idata, 0, 0);
  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  if (pattern) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

