'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pipette, ChevronDown, Sparkles } from 'lucide-react';

// Category-specific color suggestions
const COLOR_SUGGESTIONS: Record<string, { name: string; colors: string[] }[]> = {
  background: [
    { name: 'Light', colors: ['#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#e8e8e8'] },
    { name: 'Warm', colors: ['#faf8f5', '#f5f0e8', '#f0e6d8', '#e8dcc8', '#e0d0b8'] },
    { name: 'Cool', colors: ['#f5f8fa', '#e8f0f5', '#dce8f0', '#d0e0e8', '#c4d8e0'] },
    { name: 'Dark', colors: ['#1a1a1a', '#0f0f0f', '#0a0a0a', '#050505', '#000000'] },
    { name: 'Moody', colors: ['#1a1a2e', '#0f0f1a', '#0a0a12', '#12121a', '#16161f'] },
  ],
  text: [
    { name: 'Dark', colors: ['#000000', '#1a1a1a', '#2d2d2d', '#404040', '#525252'] },
    { name: 'Light', colors: ['#ffffff', '#fafafa', '#e8e8e8', '#d4d4d4', '#a3a3a3'] },
    { name: 'Warm', colors: ['#78350f', '#92400e', '#a16207', '#854d0e', '#713f12'] },
    { name: 'Accent', colors: ['#ff2d95', '#00f5ff', '#ffd700', '#ff6b35', '#7c3aed'] },
  ],
  water: [
    { name: 'Ocean', colors: ['#0077be', '#006994', '#00587a', '#004466', '#003355'] },
    { name: 'Tropical', colors: ['#00d4aa', '#00c4b4', '#00b4be', '#00a4c8', '#0094d2'] },
    { name: 'Deep', colors: ['#1e3a5f', '#162d4d', '#0f203a', '#081428', '#040a14'] },
    { name: 'Teal', colors: ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'] },
    { name: 'Dark', colors: ['#0a1628', '#050c14', '#030810', '#020508', '#010204'] },
  ],
  greenSpace: [
    { name: 'Forest', colors: ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80'] },
    { name: 'Sage', colors: ['#4d7c0f', '#65a30d', '#84cc16', '#a3e635', '#bef264'] },
    { name: 'Olive', colors: ['#3f3f00', '#4a4a00', '#555500', '#606000', '#6b6b00'] },
    { name: 'Muted', colors: ['#2d3b2d', '#3a4a3a', '#475847', '#546654', '#617461'] },
    { name: 'Teal', colors: ['#0f4c3a', '#0a3d2e', '#052e22', '#021f16', '#01100a'] },
  ],
  buildings: [
    { name: 'Neutral', colors: ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040'] },
    { name: 'Warm', colors: ['#d6ccc2', '#c4b5a5', '#a89a8a', '#8c7a6a', '#705a4a'] },
    { name: 'Cool', colors: ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'] },
    { name: 'Dark', colors: ['#27272a', '#1c1c1e', '#121214', '#0a0a0c', '#050506'] },
  ],
  roads: [
    { name: 'Neon', colors: ['#ff2d95', '#ff00ff', '#00f5ff', '#00ff88', '#ffff00'] },
    { name: 'Warm', colors: ['#ffd700', '#ffa500', '#ff6b35', '#ff4444', '#cc0000'] },
    { name: 'Cool', colors: ['#00f5ff', '#00d4ff', '#00b4ff', '#0094ff', '#0074ff'] },
    { name: 'Neutral', colors: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080'] },
    { name: 'Dark', colors: ['#404040', '#505050', '#606060', '#707070', '#808080'] },
  ],
  accent: [
    { name: 'Vibrant', colors: ['#ff2d95', '#ff6b35', '#ffd700', '#00f5ff', '#7c3aed'] },
    { name: 'Warm', colors: ['#ef4444', '#f97316', '#eab308', '#f59e0b', '#d97706'] },
    { name: 'Cool', colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'] },
    { name: 'Metallic', colors: ['#ffd700', '#c0c0c0', '#cd7f32', '#b87333', '#e5c100'] },
  ],
  contour: [
    { name: 'Subtle', colors: ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040'] },
    { name: 'Brown', colors: ['#a16207', '#92400e', '#78350f', '#713f12', '#5c2d0e'] },
    { name: 'Blue', colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'] },
  ],
  hillshade: [
    { name: 'Neutral', colors: ['#404040', '#525252', '#737373', '#a3a3a3', '#d4d4d4'] },
    { name: 'Warm', colors: ['#78350f', '#92400e', '#a16207', '#ca8a04', '#eab308'] },
    { name: 'Cool', colors: ['#1e3a5f', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6'] },
  ],
};

// Road gradient presets
const ROAD_GRADIENTS = [
  { name: 'Neon Cyan', start: '#00f5ff', end: '#003840' },
  { name: 'Neon Pink', start: '#ff2d95', end: '#3a0620' },
  { name: 'Thermal', start: '#ffffff', end: '#990000' },
  { name: 'Golden', start: '#ffd700', end: '#4a3500' },
  { name: 'Silver', start: '#e0e0e0', end: '#404040' },
  { name: 'Monochrome', start: '#ffffff', end: '#1a1a1a' },
  { name: 'Ocean', start: '#00d4ff', end: '#001a2e' },
  { name: 'Sunset', start: '#ff6b35', end: '#2d0a00' },
];

interface SmartColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  category?: string;
  label?: string;
  recentColors?: string[];
  paletteColors?: string[];
  className?: string;
}

export function SmartColorPicker({
  value,
  onChange,
  category = 'accent',
  label,
  recentColors = [],
  paletteColors = [],
  className,
}: SmartColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = COLOR_SUGGESTIONS[category] || COLOR_SUGGESTIONS.accent;

  const handleSwatchClick = (color: string) => {
    onChange(color);
  };

  const openNativePicker = () => {
    colorInputRef.current?.click();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800 w-full"
      >
        <div
          className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
          style={{ backgroundColor: value || '#888888' }}
        />
        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-left truncate font-mono">
          {value || 'Select...'}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Hidden native color input */}
      <input
        ref={colorInputRef}
        type="color"
        value={value || '#888888'}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3">
          {/* Header with picker button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {label || category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <button
              onClick={openNativePicker}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Pipette className="w-3 h-3" />
              Pick
            </button>
          </div>

          {/* Current color preview */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
            <div
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: value || '#888888' }}
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v.match(/^#[0-9a-fA-F]{0,6}$/)) {
                  onChange(v);
                }
              }}
              placeholder="#000000"
              className="flex-1 text-xs font-mono bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Suggested colors by category */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Suggestions</span>
            {suggestions.map((group) => (
              <div key={group.name} className="space-y-1">
                <span className="text-[9px] text-gray-400">{group.name}</span>
                <div className="flex gap-1 flex-wrap">
                  {group.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleSwatchClick(color)}
                      className={cn(
                        "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                        value === color
                          ? "border-blue-500 ring-1 ring-blue-500"
                          : "border-gray-200 dark:border-gray-600"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Palette colors */}
          {paletteColors.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">From Palette</span>
              <div className="flex gap-1 flex-wrap">
                {paletteColors.map((color, i) => (
                  <button
                    key={`${color}-${i}`}
                    onClick={() => handleSwatchClick(color)}
                    className={cn(
                      "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                      value === color
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-gray-200 dark:border-gray-600"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Recent</span>
              <div className="flex gap-1 flex-wrap">
                {recentColors.slice(0, 8).map((color, i) => (
                  <button
                    key={`${color}-${i}`}
                    onClick={() => handleSwatchClick(color)}
                    className={cn(
                      "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                      value === color
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-gray-200 dark:border-gray-600"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Road gradient generator component
interface RoadGradientPickerProps {
  roads: {
    motorway: string;
    trunk: string;
    primary: string;
    secondary: string;
    tertiary: string;
    residential: string;
    service: string;
  };
  onChange: (roads: RoadGradientPickerProps['roads']) => void;
  className?: string;
}

function interpolateColor(start: string, end: string, factor: number): string {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * factor);
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * factor);
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * factor);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function RoadGradientPicker({ roads, onChange, className }: RoadGradientPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyGradient = (start: string, end: string) => {
    const roadTypes = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential', 'service'] as const;
    const newRoads = {} as RoadGradientPickerProps['roads'];

    roadTypes.forEach((type, i) => {
      const factor = i / (roadTypes.length - 1);
      newRoads[type] = interpolateColor(start, end, factor);
    });

    onChange(newRoads);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        Auto Gradient
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide px-1">Preset Gradients</span>
          {ROAD_GRADIENTS.map((gradient) => (
            <button
              key={gradient.name}
              onClick={() => applyGradient(gradient.start, gradient.end)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className="w-16 h-3 rounded"
                style={{
                  background: `linear-gradient(to right, ${gradient.start}, ${gradient.end})`
                }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{gradient.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
