'use client';

import { Minus, ChevronDown, ChevronUp, MapPin, Palette, Type, Layout } from 'lucide-react';
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

// Collapsible section component for the Design tab
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
      "fixed inset-x-0 bottom-16 md:relative md:bottom-auto md:w-80 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none",
      isDrawerOpen ? "h-[50vh] md:h-full translate-y-0" : "h-0 md:h-full translate-y-full md:translate-y-0"
    )}>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between md:hidden mb-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <button
                onClick={() => setLibraryTab('examples')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                  libraryTab === 'examples'
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                Examples
              </button>
              <button
                onClick={() => setLibraryTab('saved')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                  libraryTab === 'saved'
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
          <div className="space-y-2">
            {/* Location Section */}
            <CollapsibleSection title="Location" icon={MapPin} defaultOpen={true}>
              <div className="space-y-4">
                <LocationSearch
                  onLocationSelect={updateLocation}
                  currentLocation={config.location}
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                  <p className="opacity-90">Drag the map to adjust position, or use zoom controls for perfect framing.</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Style Section */}
            <CollapsibleSection title="Style & Colors" icon={Palette}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Map Style</h4>
                  <StyleSelector
                    selectedStyleId={config.style.id}
                    onStyleSelect={updateStyle}
                    currentConfig={config}
                  />
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Color Palette</h4>
                  <ColorControls
                    palette={config.palette}
                    presets={config.style.palettes}
                    onPaletteChange={updatePalette}
                  />
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Layers</h4>
                  <LayerControls
                    layers={config.layers}
                    onLayersChange={updateLayers}
                    availableToggles={config.style.layerToggles}
                    palette={config.palette}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Typography Section */}
            <CollapsibleSection title="Text & Labels" icon={Type}>
              <TypographyControls
                config={config}
                onTypographyChange={updateTypography}
                onLocationChange={updateLocation}
              />
            </CollapsibleSection>

            {/* Format Section */}
            <CollapsibleSection title="Format & Frame" icon={Layout}>
              <FormatControls
                format={config.format}
                onFormatChange={updateFormat}
              />
            </CollapsibleSection>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <AccountPanel
              currentMapId={currentMapId}
              currentMapName={currentMapName}
              currentMapStatus={currentMapStatus}
              onPublishSuccess={onPublishSuccess}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

