'use client';

import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { ColorPalette } from '@/types/poster';
import { cn } from '@/lib/utils';

interface ColorControlsProps {
  palette: ColorPalette;
  presets?: ColorPalette[];
  onPaletteChange: (palette: ColorPalette) => void;
}

const colorLabels: Record<string, string> = {
  background: 'Background',
  primary: 'Primary',
  secondary: 'Secondary',
  water: 'Water',
  greenSpace: 'Green Space',
  text: 'Text',
  grid: 'Grid',
};

export function ColorControls({ palette, presets, onPaletteChange }: ColorControlsProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const handleColorChange = (colorKey: string, color: string) => {
    onPaletteChange({
      ...palette,
      [colorKey]: color,
    });
  };

  const visibleColorKeys = Object.keys(colorLabels).filter(key => 
    key in palette || (key === 'grid' && presets?.some(p => 'grid' in p))
  );

  return (
    <div className="space-y-4">
      {presets && presets.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-gray-600 dark:text-gray-400">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPaletteChange(preset)}
                className={cn(
                  'flex items-center gap-2 p-2 text-left border rounded transition-colors',
                  palette.id === preset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: preset.background }} />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: preset.water }} />
                </div>
                <span className="text-xs font-medium truncate text-gray-700 dark:text-gray-300">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {visibleColorKeys.map((colorKey) => (
          <div key={colorKey} className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              {colorLabels[colorKey]}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveColor(activeColor === colorKey ? null : colorKey)}
                className={cn(
                  'w-10 h-10 rounded border-2 transition-all',
                  activeColor === colorKey
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                )}
                style={{ backgroundColor: (palette as any)[colorKey] }}
                aria-label={`Select ${colorLabels[colorKey]} color`}
              />
              <input
                type="text"
                value={(palette as any)[colorKey] || ''}
                onChange={(e) => handleColorChange(colorKey, e.target.value)}
                className={cn(
                  'flex-1 px-2 py-1 text-sm border border-gray-300 rounded',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                )}
                placeholder="#000000"
              />
            </div>
            {activeColor === colorKey && (
              <div className="mt-2 p-2 bg-white border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600">
                <HexColorPicker
                  color={(palette as any)[colorKey] || '#000000'}
                  onChange={(color) => handleColorChange(colorKey, color)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

