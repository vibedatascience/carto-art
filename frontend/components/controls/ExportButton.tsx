'use client';

import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPORT_RESOLUTIONS, type ExportResolutionKey } from '@/lib/export/constants';

interface ExportButtonProps {
  onExport: (resolution: typeof EXPORT_RESOLUTIONS[ExportResolutionKey]) => void;
  isExporting: boolean;
  selectedResolution: ExportResolutionKey;
  onResolutionChange: (resolution: ExportResolutionKey) => void;
}

export function ExportButton({ onExport, isExporting, selectedResolution, onResolutionChange }: ExportButtonProps) {
  const resolution = EXPORT_RESOLUTIONS[selectedResolution];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Export Size
        </label>
        <select
          value={selectedResolution}
          onChange={(e) => onResolutionChange(e.target.value as ExportResolutionKey)}
          disabled={isExporting}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg border transition-colors",
            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {Object.entries(EXPORT_RESOLUTIONS).map(([key, res]) => (
            <option key={key} value={key}>
              {res.name} ({res.width}×{res.height}px)
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {resolution.dpi} DPI • PNG format
        </p>
      </div>

      <button
        type="button"
        onClick={() => onExport(resolution)}
        disabled={isExporting}
        className={cn(
          'group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium shadow-lg transition-all duration-300',
          'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
          'hover:shadow-xl hover:scale-105 active:scale-95',
          'disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 disabled:shadow-lg'
        )}
      >
        <div className={cn(
          "transition-transform duration-300",
          isExporting ? "scale-0 w-0" : "scale-100"
        )}>
          <Download className="h-4 w-4" />
        </div>

        {isExporting && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        <span className={cn(
          "transition-all duration-300",
          isExporting && "translate-x-4"
        )}>
          {isExporting ? 'Exporting...' : 'Export Poster'}
        </span>
      </button>
    </div>
  );
}

