'use client';

import { useState } from 'react';
import type { ColorPalette } from '@/types/poster';
import { cn } from '@/lib/utils';
import { ControlSection } from '@/components/ui/control-components';
import { SmartColorPicker } from '@/components/ui/SmartColorPicker';

interface ColorControlsProps {
  palette: ColorPalette;
  presets?: ColorPalette[];
  onPaletteChange: (palette: ColorPalette) => void;
}

const colorLabels: Record<string, { label: string; category: string }> = {
  background: { label: 'Background', category: 'background' },
  primary: { label: 'Primary', category: 'roads' },
  secondary: { label: 'Secondary', category: 'roads' },
  water: { label: 'Water', category: 'water' },
  greenSpace: { label: 'Green Space', category: 'greenSpace' },
  text: { label: 'Text', category: 'text' },
  grid: { label: 'Grid', category: 'accent' },
};

export function ColorControls({ palette, presets, onPaletteChange }: ColorControlsProps) {
  const handleColorChange = (colorKey: string, color: string) => {
    onPaletteChange({
      ...palette,
      [colorKey]: color,
    });
  };

  const visibleColorKeys = Object.keys(colorLabels).filter(key =>
    key in palette || (key === 'grid' && presets?.some(p => 'grid' in p))
  );

  // Get palette colors for the picker
  const paletteColors = Object.values(palette).filter(v => typeof v === 'string' && v.startsWith('#')) as string[];

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
          {visibleColorKeys.map((colorKey) => {
            const config = colorLabels[colorKey];
            return (
              <div key={colorKey} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 min-w-[70px]">
                  {config.label}
                </span>
                <SmartColorPicker
                  value={(palette as any)[colorKey] || ''}
                  onChange={(color) => handleColorChange(colorKey, color)}
                  category={config.category}
                  label={config.label}
                  paletteColors={paletteColors}
                  className="flex-1"
                />
              </div>
            );
          })}
        </div>
      </ControlSection>
    </div>
  );
}
