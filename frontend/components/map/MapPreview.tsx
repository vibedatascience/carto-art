'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/maplibre';
import { Loader2 } from 'lucide-react';
import type { PosterLocation, LayerToggle, PosterConfig } from '@/types/poster';
import { cn } from '@/lib/utils';
import { MarkerIcon } from './MarkerIcon';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapPreviewProps {
  mapStyle: any;
  location: PosterLocation;
  format?: PosterConfig['format'];
  showMarker?: boolean;
  markerColor?: string;
  onMapLoad?: (map: any) => void;
  onMove?: (center: [number, number], zoom: number) => void;
  layers?: PosterConfig['layers'];
  layerToggles?: LayerToggle[];
}

export function MapPreview({ 
  mapStyle, 
  location, 
  format,
  showMarker = true, 
  markerColor, 
  onMapLoad, 
  onMove 
  , layers, layerToggles
}: MapPreviewProps) {
  const mapRef = useRef<MapRef>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local viewState for smooth interaction without triggering full app re-renders on every frame
  const [viewState, setViewState] = useState({
    longitude: location.center[0],
    latitude: location.center[1],
    zoom: location.zoom,
  });

  // Sync with external location changes (e.g. search, button clicks)
  useEffect(() => {
    setViewState({
      longitude: location.center[0],
      latitude: location.center[1],
      zoom: location.zoom,
    });
  }, [location.center, location.zoom]);

  // Debug: Monitor style changes and contour layers
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      
      console.log('[DEBUG MAP] Style changed, checking contour configuration:', {
        styleName: mapStyle?.name,
        hasContourSource: !!mapStyle?.sources?.contours,
        contourSourceUrl: mapStyle?.sources?.contours?.url?.substring(0, 80),
        contourLayers: mapStyle?.layers?.filter((l: any) => 
          l.id === 'contours' || l.id.includes('contour')
        ).map((l: any) => ({
          id: l.id,
          source: l.source,
          sourceLayer: l['source-layer'],
          visibility: l.layout?.visibility,
          filter: l.filter
        }))
      });

      // Wait for next frame to check if layers are on the map
      setTimeout(() => {
        try {
          const contourLayers = ['contours', 'contours-regular', 'contours-index'].filter(id => 
            map.getLayer(id)
          );
          console.log('[DEBUG MAP] Contour layers on map after style load:', {
            found: contourLayers.length,
            layerIds: contourLayers
          });
        } catch (err) {
          console.warn('[DEBUG MAP] Error checking layers:', err);
        }
      }, 100);
    }
  }, [mapStyle]);

  const handleLoad = useCallback(() => {
    if (mapRef.current && onMapLoad) {
      const map = mapRef.current.getMap();
      onMapLoad(map);

      // Setup loading listeners
      map.on('dataloading', () => setIsLoading(true));
      map.on('idle', () => setIsLoading(false));
      
      // Safety timeout: if we're still "loading" after 10 seconds, clear it
      // This prevents being stuck on "Loading Tiles" if some tiles fail silently
      map.on('dataloading', () => {
        const timeoutId = setTimeout(() => setIsLoading(false), 10000);
        map.once('idle', () => clearTimeout(timeoutId));
      });

      // Debug logging for contour source and layers
      let contourTilesLoading = 0;
      let contourTilesLoaded = 0;

      map.on('sourcedataloading', (e: any) => {
        if (e.sourceId === 'contours' && e.tile) {
          contourTilesLoading++;
          const tileZoom = e.tile.tileID?.canonical?.z;
          const mapZoom = map.getZoom();
          if (contourTilesLoading <= 5) { // Only log first few to avoid spam
            console.log('[DEBUG MAP] Contour tile loading:', {
              sourceId: e.sourceId,
              tileZoom,
              mapZoom: mapZoom.toFixed(2),
              fetchingHigher: tileZoom && tileZoom > Math.floor(mapZoom),
              tilesInQueue: contourTilesLoading - contourTilesLoaded,
              tileID: `${e.tile.tileID?.canonical?.z}/${e.tile.tileID?.canonical?.x}/${e.tile.tileID?.canonical?.y}`
            });
          }
        }
      });

      map.on('sourcedata', (e: any) => {
        if (e.sourceId === 'contours' && e.tile) {
          contourTilesLoaded++;
          if (contourTilesLoading > 5 && contourTilesLoaded === contourTilesLoading) {
            console.log(`[DEBUG MAP] ✅ All ${contourTilesLoaded} contour tiles loaded`);
          }
        }
      });

      map.on('sourcedata', (e: any) => {
        if (e.sourceId === 'contours') {
          console.log('[DEBUG MAP] Contour source data loaded:', {
            sourceId: e.sourceId,
            dataType: e.dataType,
            isSourceLoaded: e.isSourceLoaded,
            tile: e.tile ? {
              tileID: e.tile.tileID,
              state: e.tile.state
            } : null
          });

          // Try to query features from the source to see if data exists
          try {
            const source = map.getSource('contours');
            if (source && source.type === 'vector') {
              // FIRST: Query without specifying sourceLayer to see all available layers
              const allFeaturesAllLayers = map.querySourceFeatures('contours');
              const uniqueSourceLayers = [...new Set(allFeaturesAllLayers.map((f: any) => f.sourceLayer))];

              console.log('[DEBUG MAP] ⚠️ CRITICAL - Available source-layers in contours source:', {
                count: allFeaturesAllLayers.length,
                sourceLayers: uniqueSourceLayers,
                sampleByLayer: uniqueSourceLayers.slice(0, 5).map(layer => ({
                  sourceLayer: layer,
                  sampleFeature: allFeaturesAllLayers.find((f: any) => f.sourceLayer === layer)?.properties
                }))
              });

              // Then query WITH sourceLayer 'contour'
              const allFeatures = map.querySourceFeatures('contours', {
                sourceLayer: 'contour'
              });

              console.log('[DEBUG MAP] All contour features (sourceLayer="contour"):', {
                count: allFeatures.length,
                sampleFeatures: allFeatures.slice(0, 3).map((f: any) => ({
                  id: f.id,
                  properties: f.properties,
                  propertyKeys: Object.keys(f.properties || {}),
                  geometry: f.geometry?.type
                }))
              });

              // Now query with the height filter (MapTiler contours-v2 uses 'height' not 'ele' or 'elevation')
              const featuresWithHeight = map.querySourceFeatures('contours', {
                sourceLayer: 'contour',
                filter: ['has', 'height']
              });

              console.log('[DEBUG MAP] Contour features with height property:', {
                count: featuresWithHeight.length,
                sampleFeatures: featuresWithHeight.slice(0, 5).map((f: any) => ({
                  id: f.id,
                  properties: f.properties,
                  geometry: f.geometry?.type
                }))
              });

              // Check what elevation values exist (try multiple property names)
              const propertyNames = ['ele', 'elevation', 'ELE', 'ELEVATION', 'height'];
              let foundPropertyName: string | null = null;

              const elevations = allFeatures
                .map((f: any) => {
                  // Check multiple possible property names
                  for (const propName of propertyNames) {
                    const value = f.properties?.[propName];
                    if (value != null && typeof value === 'number') {
                      if (!foundPropertyName) foundPropertyName = propName;
                      return value;
                    }
                  }
                  return null;
                })
                .filter((ele: any) => ele != null && typeof ele === 'number')
                .sort((a: number, b: number) => a - b);

              if (elevations.length > 0) {
                const uniqueElevations = [...new Set(elevations)];
                console.log('[DEBUG MAP] Elevation values in data:', {
                  propertyName: foundPropertyName,
                  total: elevations.length,
                  unique: uniqueElevations.length,
                  min: Math.min(...elevations),
                  max: Math.max(...elevations),
                  sample: uniqueElevations.slice(0, 20),
                  intervals: uniqueElevations.slice(1).map((val, i) => val - uniqueElevations[i]).slice(0, 10)
                });
                console.log(`[DEBUG MAP] ✅ Contours use property "${foundPropertyName}" - filters should match this property name`);
              } else if (allFeatures.length > 0) {
                const allPropertyKeys = [...new Set(allFeatures.flatMap((f: any) => Object.keys(f.properties || {})))];
                console.warn('[DEBUG MAP] Features exist but no elevation property found. Property names:', allPropertyKeys);
                console.log('[DEBUG MAP] Sample feature properties:', allFeatures[0]?.properties);
              }
            }
          } catch (err) {
            console.warn('[DEBUG MAP] Error querying contour features:', err);
          }
        }
      });

      map.on('data', (e: any) => {
        if (e.dataType === 'source' && e.sourceId === 'contours') {
          console.log('[DEBUG MAP] Contour source data event:', {
            sourceId: e.sourceId,
            dataType: e.dataType,
            isSourceLoaded: e.isSourceLoaded
          });
        }
      });

      // Check contour layers after map is idle
      map.on('idle', () => {
        try {
          const contourLayers = ['contours', 'contours-regular', 'contours-index'].filter(id => 
            map.getLayer(id)
          );
          
          if (contourLayers.length > 0) {
            console.log('[DEBUG MAP] Contour layers on map:', {
              layerIds: contourLayers,
              layers: contourLayers.map(id => {
                const layer = map.getLayer(id);
                const source = layer ? map.getSource((layer as any).source) : null;
                return {
                  id,
                  exists: !!layer,
                  visibility: (layer as any)?.layout?.visibility,
                  source: (layer as any)?.source,
                  sourceExists: !!source,
                  sourceType: source?.type
                };
              })
            });

            // Try to query features - try multiple approaches
            const source = map.getSource('contours');
            if (source && source.type === 'vector') {
              // Try querying without sourceLayer first
              try {
                const allFeaturesNoLayer = map.querySourceFeatures('contours');
                console.log('[DEBUG MAP] All features (no sourceLayer specified):', {
                  count: allFeaturesNoLayer.length,
                  sample: allFeaturesNoLayer.slice(0, 2).map((f: any) => ({
                    sourceLayer: f.sourceLayer,
                    properties: f.properties
                  }))
                });
              } catch (err) {
                console.warn('[DEBUG MAP] Error querying without sourceLayer:', err);
              }

              // Try with 'contour' sourceLayer
              try {
                const allFeatures = map.querySourceFeatures('contours', {
                  sourceLayer: 'contour'
                });
                
                console.log('[DEBUG MAP] All contour features (sourceLayer: "contour"):', {
                  count: allFeatures.length,
                  sampleFeatures: allFeatures.slice(0, 3).map((f: any) => ({
                    id: f.id,
                    properties: f.properties,
                    propertyKeys: Object.keys(f.properties || {}),
                    geometry: f.geometry?.type
                  }))
                });

                if (allFeatures.length === 0) {
                  // Try other possible source-layer names
                  const possibleLayers = ['contours', 'elevation', 'elevation_contour', 'contourlines'];
                  for (const layerName of possibleLayers) {
                    try {
                      const testFeatures = map.querySourceFeatures('contours', {
                        sourceLayer: layerName
                      });
                      if (testFeatures.length > 0) {
                        console.log(`[DEBUG MAP] Found features with sourceLayer "${layerName}":`, {
                          count: testFeatures.length,
                          sample: testFeatures[0]?.properties
                        });
                      }
                    } catch (e) {
                      // Ignore
                    }
                  }
                } else {
                  // If we found features, check elevation values
                  const elevations = allFeatures
                    .map((f: any) => {
                      return f.properties?.ele || 
                             f.properties?.elevation || 
                             f.properties?.ELE || 
                             f.properties?.ELEVATION ||
                             f.properties?.height;
                    })
                    .filter((ele: any) => ele != null && typeof ele === 'number')
                    .sort((a: number, b: number) => a - b);
                  
                  if (elevations.length > 0) {
                    const uniqueElevations = [...new Set(elevations)];
                    console.log('[DEBUG MAP] Elevation values in data:', {
                      total: elevations.length,
                      unique: uniqueElevations.length,
                      min: Math.min(...elevations),
                      max: Math.max(...elevations),
                      sample: uniqueElevations.slice(0, 20),
                      intervals: uniqueElevations.slice(1).map((val, i) => val - uniqueElevations[i]).slice(0, 10)
                    });
                  } else {
                    const allPropertyKeys = [...new Set(allFeatures.flatMap((f: any) => Object.keys(f.properties || {})))];
                    console.warn('[DEBUG MAP] Features exist but no elevation property found. Property names:', allPropertyKeys);
                    console.log('[DEBUG MAP] Sample feature properties:', allFeatures[0]?.properties);
                  }
                }
              } catch (err) {
                console.warn('[DEBUG MAP] Error querying with sourceLayer:', err);
              }
            }

            // Query rendered features
            contourLayers.forEach(layerId => {
              try {
                const features = map.queryRenderedFeatures(undefined, {
                  layers: [layerId]
                });
                console.log(`[DEBUG MAP] Rendered features for ${layerId}:`, {
                  count: features.length,
                  sample: features.slice(0, 3).map((f: any) => ({
                    id: f.id,
                    properties: f.properties
                  }))
                });
              } catch (err) {
                console.warn(`[DEBUG MAP] Error querying rendered features for ${layerId}:`, err);
              }
            });
          }
        } catch (err) {
          console.warn('[DEBUG MAP] Error checking contour layers:', err);
        }
      });
    }
  }, [onMapLoad]);

  const handleMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
    if (onMove) {
      onMove([evt.viewState.longitude, evt.viewState.latitude], evt.viewState.zoom);
    }
  }, [onMove]);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = useCallback((e: any) => {
    console.error('MapLibre error details:', {
      message: e.error?.message || e.message || 'Unknown map error',
      error: e.error,
      originalEvent: e
    });
    setHasError(true);
    const msg = e.error?.message || e.message || 'Unable to load map data';
    setErrorMessage(msg);
  }, []);

  // Check for edge cases (Antarctica, very remote locations)
  const isEdgeCase = location.center[1] < -60 || Math.abs(location.center[0]) > 170;

  return (
    <div className="relative w-full h-full">
      {hasError || isEdgeCase ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
          <div className="text-center p-8 max-w-md">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {hasError ? 'Map Loading Error' : 'Limited Map Data'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {hasError 
                ? errorMessage || 'Unable to load map data for this location. Try a different area or zoom level.'
                : 'Map data may be limited for this remote location. Try adjusting the zoom level or selecting a different area.'
              }
            </p>
            <button
              onClick={() => {
                setHasError(false);
                setErrorMessage(null);
                if (mapRef.current) {
                  const map = mapRef.current.getMap();
                  map.resize();
                }
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : null}
        <Map
        ref={mapRef}
        key={`${format?.aspectRatio}-${format?.orientation}`}
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
        preserveDrawingBuffer={true}
        onLoad={handleLoad}
        onMove={handleMove}
        onMoveEnd={handleMove}
        onError={handleError}
        antialias={true}
        pixelRatio={2}
        maxZoom={14}
        minZoom={1}
      >
      {showMarker && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <MarkerIcon 
            type={layers?.markerType || 'crosshair'} 
            color={markerColor} 
            size={40} 
          />
        </div>
      )}
      </Map>

      {/* Tile Loading Indicator */}
      <div 
        className={cn(
          "absolute top-4 left-4 z-30 transition-opacity duration-300 pointer-events-none",
          isLoading ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-2 shadow-sm">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Loading Tiles...
          </span>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Zoom: {viewState.zoom.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Texture Overlay */}
      {format?.texture && format.texture !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: (format.textureIntensity || 20) / 100,
            filter: format.texture === 'canvas' ? 'contrast(120%) brightness(110%)' : 'none'
          }}
        />
      )}
    </div>
  );
}

