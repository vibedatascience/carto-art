'use client';

import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { ColorPalette } from '@/types/poster';
import { cn } from '@/lib/utils';
import { ControlSection, ControlGroup, ControlLabel, ControlInput } from '@/components/ui/control-components';
import { Check, Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

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
        <ControlSection title="Presets">
          <div className="grid grid-cols-3 gap-1.5">
            {presets.map((preset) => {
              const isActive = palette.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onPaletteChange(preset)}
                  className={cn(
                    'group relative flex flex-col items-center gap-1.5 p-2 rounded transition-all',
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full border border-white dark:border-gray-900" style={{ backgroundColor: preset.background }} />
                    <div className="w-4 h-4 rounded-full border border-white dark:border-gray-900" style={{ backgroundColor: preset.primary }} />
                    <div className="w-4 h-4 rounded-full border border-white dark:border-gray-900" style={{ backgroundColor: preset.water }} />
                  </div>
                  <span className={cn(
                    "text-[10px] truncate w-full text-center",
                    isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </ControlSection>
      )}

      <ControlSection title="Custom">
        <div className="space-y-2">
          {visibleColorKeys.map((colorKey) => (
            <div key={colorKey} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveColor(activeColor === colorKey ? null : colorKey)}
                className={cn(
                  'w-6 h-6 rounded border transition-all flex-shrink-0',
                  activeColor === colorKey
                    ? 'border-gray-400 dark:border-gray-500'
                    : 'border-gray-200 dark:border-gray-700'
                )}
                style={{ backgroundColor: (palette as any)[colorKey] }}
                aria-label={`Select ${colorLabels[colorKey]} color`}
              />
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-1">{colorLabels[colorKey]}</span>
              <input
                type="text"
                value={(palette as any)[colorKey] || ''}
                onChange={(e) => handleColorChange(colorKey, e.target.value)}
                className="w-20 text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                placeholder="#000000"
              />
              {activeColor === colorKey && (
                <div className="absolute left-0 top-full mt-1 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setActiveColor(null)}
                  />
                  <HexColorPicker
                    color={(palette as any)[colorKey] || '#000000'}
                    onChange={(color) => handleColorChange(colorKey, color)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </ControlSection>
    </div>
  );
}

