'use client';

import type { PosterStyle, PosterConfig } from '@/types/poster';
import { styles } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { ControlSection } from '@/components/ui/control-components';

interface StyleSelectorProps {
  selectedStyleId: string;
  onStyleSelect: (style: PosterStyle) => void;
  currentConfig: PosterConfig;
}

export function StyleSelector({ selectedStyleId, onStyleSelect }: StyleSelectorProps) {
  return (
    <ControlSection title="Style">
      <div className="space-y-0.5">
        {styles.map((style) => {
          const isSelected = selectedStyleId === style.id;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleSelect(style)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded text-xs transition-colors',
                isSelected
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              {style.name}
            </button>
          );
        })}
      </div>
    </ControlSection>
  );
}

