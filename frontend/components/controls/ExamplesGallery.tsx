import React from 'react';
import { POSTER_EXAMPLES } from '@/lib/config/examples';
import { PosterConfig } from '@/types/poster';
import { cn } from '@/lib/utils';
import { PosterThumbnail } from '../map/PosterThumbnail';
import { ControlSection } from '@/components/ui/control-components';

interface ExamplesGalleryProps {
  onSelect: (config: PosterConfig) => void;
  currentConfig: PosterConfig;
}

export const ExamplesGallery: React.FC<ExamplesGalleryProps> = ({ onSelect, currentConfig }) => {
  return (
    <ControlSection title="Examples">
      <div className="grid grid-cols-2 gap-2">
        {POSTER_EXAMPLES.map((example) => {
          const isActive = currentConfig.location.name === example.config.location.name &&
                          currentConfig.style.id === example.config.style.id;

          return (
            <button
              key={example.id}
              onClick={() => onSelect(example.config)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded text-left",
                isActive
                  ? "ring-1 ring-gray-400 dark:ring-gray-500"
                  : "hover:opacity-80"
              )}
            >
              <div className="aspect-[3/4] w-full relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <PosterThumbnail
                  config={example.config}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                  <h3 className="font-medium text-[10px] leading-tight truncate">{example.name}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ControlSection>
  );
};

