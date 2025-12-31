'use client';

import { PosterConfig } from '@/types/poster';
import { cn } from '@/lib/utils';

interface FormatControlsProps {
  format: PosterConfig['format'];
  onFormatChange: (format: Partial<PosterConfig['format']>) => void;
}

const aspectRatioOptions: Array<{
  value: PosterConfig['format']['aspectRatio'];
  label: string;
  description?: string;
}> = [
  { value: '2:3', label: '2:3', description: '24×36" (standard poster)' },
  { value: '3:4', label: '3:4', description: '18×24"' },
  { value: '4:5', label: '4:5', description: '16×20"' },
  { value: '1:1', label: '1:1', description: 'Square' },
  { value: 'ISO', label: 'ISO (A-series)', description: '1:√2 ratio' },
];

export function FormatControls({ format, onFormatChange }: FormatControlsProps) {
  return (
    <div className="space-y-6">
      {/* Aspect Ratio */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFormatChange({ aspectRatio: option.value })}
              className={cn(
                'flex flex-col items-start p-2 text-left border rounded transition-colors',
                format.aspectRatio === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              )}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          Orientation
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onFormatChange({ orientation: 'portrait' })}
            className={cn(
              'p-2 border rounded transition-colors',
              format.orientation === 'portrait'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            )}
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Portrait
            </span>
          </button>
          <button
            type="button"
            onClick={() => onFormatChange({ orientation: 'landscape' })}
            className={cn(
              'p-2 border rounded transition-colors',
              format.orientation === 'landscape'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            )}
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Landscape
            </span>
          </button>
        </div>
      </div>

      {/* Margin */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
          <span>Margin</span>
          <span>{format.margin}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={format.margin}
          onChange={(e) => onFormatChange({ margin: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
        />
      </div>

      {/* Border Style */}
      <div className="space-y-2">
        <label className="text-xs text-gray-600 dark:text-gray-400">
          Border Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['none', 'thin', 'thick', 'double', 'inset'].map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onFormatChange({ borderStyle: style as PosterConfig['format']['borderStyle'] })}
              className={cn(
                'p-2 border rounded transition-colors capitalize',
                format.borderStyle === style
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              )}
            >
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {style}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Media & Texture */}
      <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Media Texture
        </label>
        <div className="flex flex-wrap gap-2">
          {['none', 'paper', 'canvas', 'grain'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onFormatChange({ texture: t as any })}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-all",
                format.texture === t 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-transparent border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
              )}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        
        {format.texture && format.texture !== 'none' && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[10px] text-gray-400 uppercase">
              <span>Texture Intensity</span>
              <span>{format.textureIntensity || 20}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={format.textureIntensity || 20}
              onChange={(e) => onFormatChange({ textureIntensity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
