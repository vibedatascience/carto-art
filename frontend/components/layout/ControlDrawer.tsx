'use client';

import { Minus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LocationSearch } from '@/components/controls/LocationSearch';
import { StyleSelector } from '@/components/controls/StyleSelector';
import { ColorControls } from '@/components/controls/ColorControls';
import { TypographyControls } from '@/components/controls/TypographyControls';
import { LayerControls } from '@/components/controls/LayerControls';
import { FormatControls } from '@/components/controls/FormatControls';
import { ExamplesGallery } from '@/components/controls/ExamplesGallery';
import { SavedProjects } from '@/components/controls/SavedProjects';
import { AccountPanel } from '@/components/controls/AccountPanel';
import type { Tab } from './TabNavigation';
import type { PosterConfig, PosterLocation, PosterStyle, ColorPalette, SavedProject } from '@/types/poster';

// Minimal collapsible section
function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform", isOpen && "rotate-90")} />
        {title}
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  );
}

interface ControlDrawerProps {
  activeTab: Tab;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  config: PosterConfig;
  updateLocation: (location: Partial<PosterLocation>) => void;
  updateStyle: (style: PosterStyle) => void;
  updatePalette: (palette: ColorPalette) => void;
  updateTypography: (typography: Partial<PosterConfig['typography']>) => void;
  updateFormat: (format: Partial<PosterConfig['format']>) => void;
  updateLayers: (layers: Partial<PosterConfig['layers']>) => void;
  setConfig: (config: PosterConfig) => void;
  savedProjects: SavedProject[];
  saveProject: (name: string, config: PosterConfig, thumbnailBlob?: Blob) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  currentMapId: string | null;
  currentMapName: string | null;
  currentMapStatus: {
    isSaved: boolean;
    isPublished: boolean;
    hasUnsavedChanges: boolean;
  } | null;
  onLoadProject: (project: SavedProject) => void;
  onPublishSuccess: () => void;
}

export function ControlDrawer({
  activeTab,
  isDrawerOpen,
  setIsDrawerOpen,
  config,
  updateLocation,
  updateStyle,
  updatePalette,
  updateTypography,
  updateFormat,
  updateLayers,
  setConfig,
  savedProjects,
  saveProject,
  deleteProject,
  renameProject,
  currentMapId,
  currentMapName,
  currentMapStatus,
  onLoadProject,
  onPublishSuccess,
}: ControlDrawerProps) {
  const [libraryTab, setLibraryTab] = useState<'examples' | 'saved'>('examples');

  return (
    <aside className={cn(
      "fixed inset-x-0 bottom-14 md:relative md:bottom-auto md:w-72 bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-r border-gray-100 dark:border-gray-800 overflow-y-auto flex flex-col z-50 transition-all duration-200",
      isDrawerOpen ? "h-[50vh] md:h-full translate-y-0" : "h-0 md:h-full translate-y-full md:translate-y-0"
    )}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between md:hidden">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{activeTab}</span>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex gap-1">
              <button
                onClick={() => setLibraryTab('examples')}
                className={cn(
                  "flex-1 py-1.5 text-xs transition-colors rounded",
                  libraryTab === 'examples'
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                Examples
              </button>
              <button
                onClick={() => setLibraryTab('saved')}
                className={cn(
                  "flex-1 py-1.5 text-xs transition-colors rounded",
                  libraryTab === 'saved'
                    ? "text-gray-900 dark:text-white font-medium"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                Saved
              </button>
            </div>

            {libraryTab === 'examples' ? (
              <ExamplesGallery
                onSelect={setConfig}
                currentConfig={config}
              />
            ) : (
              <SavedProjects
                projects={savedProjects}
                currentConfig={config}
                onSave={saveProject}
                onLoad={onLoadProject}
                onDelete={deleteProject}
                onRename={renameProject}
              />
            )}
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-1">
            <CollapsibleSection title="Location" defaultOpen={true}>
              <LocationSearch
                onLocationSelect={updateLocation}
                currentLocation={config.location}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Style & Colors">
              <div className="space-y-4">
                <StyleSelector
                  selectedStyleId={config.style.id}
                  onStyleSelect={updateStyle}
                  currentConfig={config}
                />
                <ColorControls
                  palette={config.palette}
                  presets={config.style.palettes}
                  onPaletteChange={updatePalette}
                />
                <LayerControls
                  layers={config.layers}
                  onLayersChange={updateLayers}
                  availableToggles={config.style.layerToggles}
                  palette={config.palette}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Text & Labels">
              <TypographyControls
                config={config}
                onTypographyChange={updateTypography}
                onLocationChange={updateLocation}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Format & Frame">
              <FormatControls
                format={config.format}
                onFormatChange={updateFormat}
              />
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'account' && (
          <AccountPanel
            currentMapId={currentMapId}
            currentMapName={currentMapName}
            currentMapStatus={currentMapStatus}
            onPublishSuccess={onPublishSuccess}
          />
        )}
      </div>
    </aside>
  );
}

