'use client';

import type { PosterStyle } from '@/types/poster';
import { styles } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface StyleSelectorProps {
  selectedStyleId: string;
  onStyleSelect: (style: PosterStyle) => void;
}

export function StyleSelector({ selectedStyleId, onStyleSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {styles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onStyleSelect(style)}
            className={cn(
              'p-3 text-left border rounded-lg transition-colors',
              selectedStyleId === style.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            )}
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {style.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {style.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

