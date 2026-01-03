'use client';

import { PosterConfig, LayerToggle, ColorPalette } from '@/types/poster';
import { cn } from '@/lib/utils';
import { HexColorPicker } from 'react-colorful';
import { useState, useMemo } from 'react';
import { Heart, Home, MapPin, Target, Circle, Radio } from 'lucide-react';
import { ControlSection, ControlSlider, CollapsibleSection } from '@/components/ui/control-components';

interface LayerControlsProps {
  layers: PosterConfig['layers'];
  onLayersChange: (layers: Partial<PosterConfig['layers']>) => void;
  availableToggles: LayerToggle[];
  palette: ColorPalette;
}

const markerTypes = [
  { id: 'crosshair', icon: Target },
  { id: 'pin', icon: MapPin },
  { id: 'dot', icon: Circle },
  { id: 'ring', icon: Radio },
  { id: 'heart', icon: Heart },
  { id: 'home', icon: Home },
] as const;

export function LayerControls({ layers, onLayersChange, availableToggles, palette }: LayerControlsProps) {
  const [showMarkerColorPicker, setShowMarkerColorPicker] = useState(false);

  const effectiveMarkerColor = useMemo(() => {
    return layers.markerColor || palette.primary || palette.accent || palette.text;
  }, [layers.markerColor, palette.primary, palette.accent, palette.text]);

  const toggleLayer = (key: keyof PosterConfig['layers']) => {
    onLayersChange({ [key]: !layers[key] });
  };

  const isTerrainUnderWaterToggleVisible = availableToggles.some(t => t.id === 'terrainUnderWater');

  // Categorize layers
  const geographicLayers = availableToggles.filter(t =>
    ['terrain', 'water', 'parks', 'buildings', 'terrainUnderWater', 'contours', 'boundaries'].includes(t.id)
  );
  const labelLayers = availableToggles.filter(t =>
    ['labels', 'labels-admin', 'labels-cities'].includes(t.id)
  );
  const dataLayers = availableToggles.filter(t =>
    ['streets', 'population', 'pois'].includes(t.id)
  );

  const LayerCheckbox = ({ id, name }: { id: string; name: string }) => (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer group">
      <input
        type="checkbox"
        className="h-3 w-3 rounded border-gray-300 text-gray-900 focus:ring-0 dark:border-gray-600 dark:bg-gray-800"
        checked={Boolean(layers[id as keyof PosterConfig['layers']])}
        onChange={() => toggleLayer(id as keyof PosterConfig['layers'])}
      />
      <span className="text-[11px] text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
        {name}
      </span>
    </label>
  );

  return (
    <ControlSection title="Layers">
      <div className="space-y-3">
        {/* Marker */}
        <div className="space-y-2">
          <LayerCheckbox id="marker" name="Location Marker" />
          {layers.marker && (
            <div className="pl-5 flex items-center gap-1.5">
              {markerTypes.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onLayersChange({ markerType: id })}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    layers.markerType === id
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMarkerColorPicker(!showMarkerColorPicker)}
                  className="w-5 h-5 rounded border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: effectiveMarkerColor }}
                />
                {showMarkerColorPicker && (
                  <div className="absolute right-0 top-full mt-1 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <div className="fixed inset-0 z-[-1]" onClick={() => setShowMarkerColorPicker(false)} />
                    <HexColorPicker
                      color={effectiveMarkerColor}
                      onChange={(color) => onLayersChange({ markerColor: color })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Geographic */}
        {geographicLayers.length > 0 && (
          <CollapsibleSection title="Geographic" defaultOpen={true} className="text-[10px]">
            <div className="space-y-0.5">
              {geographicLayers.map((item) => (
                <div key={item.id}>
                  <LayerCheckbox id={item.id} name={item.name} />
                  {item.id === 'terrain' && layers.terrain && (
                    <div className="pl-5 py-1">
                      <ControlSlider
                        min="0"
                        max="1"
                        step="0.05"
                        value={layers.hillshadeExaggeration ?? 0.5}
                        onChange={(e) => onLayersChange({ hillshadeExaggeration: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      {isTerrainUnderWaterToggleVisible && (
                        <LayerCheckbox id="terrainUnderWater" name="Under water" />
                      )}
                    </div>
                  )}
                  {item.id === 'contours' && layers.contours && (
                    <div className="pl-5 py-1">
                      <ControlSlider
                        min="10"
                        max="250"
                        step="10"
                        value={layers.contourDensity ?? 50}
                        onChange={(e) => onLayersChange({ contourDensity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Labels */}
        {labelLayers.length > 0 && (
          <CollapsibleSection title="Labels" defaultOpen={false} className="text-[10px]">
            <div className="space-y-0.5">
              {labelLayers.map((item) => (
                <LayerCheckbox key={item.id} id={item.id} name={item.name} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Data */}
        {dataLayers.length > 0 && (
          <CollapsibleSection title="Data" defaultOpen={true} className="text-[10px]">
            <div className="space-y-0.5">
              {dataLayers.map((item) => (
                <div key={item.id}>
                  <LayerCheckbox id={item.id} name={item.name} />
                  {item.id === 'streets' && layers.streets && (
                    <div className="pl-5 py-1">
                      <ControlSlider
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={layers.roadWeight ?? 1}
                        onChange={(e) => onLayersChange({ roadWeight: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </ControlSection>
  );
}
