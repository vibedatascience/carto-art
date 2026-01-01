'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/maplibre';
import { Loader2 } from 'lucide-react';
import type { PosterLocation, LayerToggle, PosterConfig } from '@/types/poster';
import { cn } from '@/lib/utils';
import { MarkerIcon } from './MarkerIcon';
import { MAP, TIMEOUTS, TEXTURE } from '@/lib/constants';
import { logger } from '@/lib/logger';
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
  
  // Store event handler references and timeout IDs for cleanup
  const loadingHandlerRef = useRef<(() => void) | null>(null);
  const idleHandlerRef = useRef<(() => void) | null>(null);
  const timeoutHandlerRef = useRef<(() => void) | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

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


  const handleLoad = useCallback(() => {
    console.log('🚀 [SPACEPORT DEBUG] handleLoad called - map should be loading');
    if (mapRef.current && onMapLoad) {
      const map = mapRef.current.getMap();
      console.log('🚀 [SPACEPORT DEBUG] Map instance obtained, calling onMapLoad');
      onMapLoad(map);

      // Debug: Check for aeroway and POI data, specifically spaceports
      console.log('🚀 [SPACEPORT DEBUG] Starting spaceport data check...');
      map.once('idle', () => {
        console.log('🚀 [SPACEPORT DEBUG] Map is idle, checking spaceport data...');
        try {
          const aerowayFeatures = map.querySourceFeatures('openmaptiles', {
            sourceLayer: 'aeroway'
          });
          const aerodromeFeatures = map.querySourceFeatures('openmaptiles', {
            sourceLayer: 'aerodrome_label'
          });
          const poiFeatures = map.querySourceFeatures('openmaptiles', {
            sourceLayer: 'poi'
          });

          // Specifically filter for spaceports
          const spaceportAreas = aerowayFeatures.filter((f: any) => 
            f.properties?.class === 'spaceport' || 
            (f.properties?.name && typeof f.properties.name === 'string' && 
             f.properties.name.toLowerCase().includes('spaceport'))
          );
          
          const spaceportLabels = aerodromeFeatures.filter((f: any) => 
            f.properties?.class === 'spaceport' ||
            (f.properties?.name && typeof f.properties.name === 'string' && 
             (f.properties.name.toLowerCase().includes('spaceport') ||
              f.properties.name.toLowerCase().includes('space center') ||
              f.properties.name.toLowerCase().includes('ksc')))
          );

          console.log('🚀 [SPACEPORT DEBUG] Spaceport-specific data:', {
            spaceportAreaCount: spaceportAreas.length,
            spaceportLabelCount: spaceportLabels.length,
            currentZoom: map.getZoom().toFixed(2),
            spaceportAreaFeatures: spaceportAreas.map((f: any) => ({
              class: f.properties?.class,
              name: f.properties?.name || f.properties?.['name:en'] || f.properties?.['name:latin'],
              geometry: f.geometry?.type
            })),
            spaceportLabelFeatures: spaceportLabels.map((f: any) => ({
              class: f.properties?.class,
              name: f.properties?.name || f.properties?.['name:en'] || f.properties?.['name:latin'],
              geometry: f.geometry?.type
            }))
          });

          // Check all aeroway classes for debugging
          const aerowayClasses = aerowayFeatures.length > 0 
            ? [...new Set(aerowayFeatures.map((f: any) => f.properties?.class).filter(Boolean))]
            : [];
          const aerodromeClasses = aerodromeFeatures.length > 0
            ? [...new Set(aerodromeFeatures.map((f: any) => f.properties?.class).filter(Boolean))]
            : [];

          console.log('🚀 [SPACEPORT DEBUG] Available classes in source layers:', {
            aerowayClasses,
            aerodromeClasses,
            totalAerowayCount: aerowayFeatures.length,
            totalAerodromeCount: aerodromeFeatures.length
          });

          // Check if spaceport layers exist and their configuration
          const spaceportAreaLayer = map.getLayer('spaceport-area');
          const spaceportLabelLayer = map.getLayer('spaceport-label');
          
          console.log('🚀 [SPACEPORT DEBUG] Spaceport layer configuration:', {
            spaceportAreaLayer: spaceportAreaLayer ? {
              exists: true,
              visibility: (spaceportAreaLayer as any).layout?.visibility || 'visible (default)',
              sourceLayer: (spaceportAreaLayer as any).sourceLayer,
              filter: (spaceportAreaLayer as any).filter,
              paint: (spaceportAreaLayer as any).paint
            } : { exists: false },
            spaceportLabelLayer: spaceportLabelLayer ? {
              exists: true,
              visibility: (spaceportLabelLayer as any).layout?.visibility || 'visible (default)',
              sourceLayer: (spaceportLabelLayer as any).sourceLayer,
              filter: (spaceportLabelLayer as any).filter,
              minzoom: (spaceportLabelLayer as any).minzoom,
              layout: {
                'text-field': (spaceportLabelLayer as any).layout?.['text-field'],
                'text-allow-overlap': (spaceportLabelLayer as any).layout?.['text-allow-overlap'],
                'text-optional': (spaceportLabelLayer as any).layout?.['text-optional'],
                'text-size': (spaceportLabelLayer as any).layout?.['text-size']
              }
            } : { exists: false }
          });

          // Check if we have spaceport areas but no labels
          if (spaceportAreas.length > 0 && spaceportLabels.length === 0) {
            logger.warn('🚀 [SPACEPORT DEBUG] ⚠️ Found spaceport areas but NO matching labels in aerodrome_label layer!', {
              areaCount: spaceportAreas.length,
              areas: spaceportAreas.map((f: any) => ({
                name: f.properties?.name || f.properties?.['name:en'] || f.properties?.['name:latin'],
                class: f.properties?.class
              })),
              suggestion: 'Labels may not exist in aerodrome_label source layer, or filter may be too restrictive'
            });
          }

          // General layer check
          const layerCheck = ['aeroway-area', 'aeroway-runway', 'aerodrome-label', 'spaceport-area', 'spaceport-label', 'poi-symbol', 'poi-label'].map(id => {
            const layer = map.getLayer(id);
            return {
              id,
              exists: !!layer,
              visibility: layer ? ((layer as any).layout?.visibility || 'visible (default)') : 'n/a'
            };
          });
          console.log('🚀 [SPACEPORT DEBUG] All POI-related layer status:', layerCheck);
        } catch (err) {
          logger.error('🚀 [SPACEPORT DEBUG] Error checking spaceport data:', err);
        }
      });

      // Create named handler functions for proper cleanup
      const loadingHandler = () => setIsLoading(true);
      const idleHandler = () => {
        setIsLoading(false);
        // Clear any pending timeout when map becomes idle
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      };
      
      // Safety timeout: if we're still "loading" after 10 seconds, clear it
      // This prevents being stuck on "Loading Tiles" if some tiles fail silently
      const timeoutHandler = () => {
        // Clear any existing timeout
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        // Set new timeout
        timeoutIdRef.current = setTimeout(() => setIsLoading(false), TIMEOUTS.MAP_LOADING);
        // Clear timeout when map becomes idle
        map.once('idle', () => {
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }
        });
      };

      // Store handler references
      loadingHandlerRef.current = loadingHandler;
      idleHandlerRef.current = idleHandler;
      timeoutHandlerRef.current = timeoutHandler;

      // Setup loading listeners
      map.on('dataloading', loadingHandler);
      map.on('idle', idleHandler);
      map.on('dataloading', timeoutHandler);
    }
  }, [onMapLoad]);

  // Cleanup event listeners and timeouts when component unmounts or map changes
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        
        // Remove event listeners
        if (loadingHandlerRef.current) {
          map.off('dataloading', loadingHandlerRef.current);
          loadingHandlerRef.current = null;
        }
        if (idleHandlerRef.current) {
          map.off('idle', idleHandlerRef.current);
          idleHandlerRef.current = null;
        }
        if (timeoutHandlerRef.current) {
          map.off('dataloading', timeoutHandlerRef.current);
          timeoutHandlerRef.current = null;
        }
        
        // Clear any pending timeouts
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      }
    };
  }, [mapStyle]); // Re-run cleanup when map style changes (new map instance)

  const handleMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
    if (onMove) {
      onMove([evt.viewState.longitude, evt.viewState.latitude], evt.viewState.zoom);
    }
  }, [onMove]);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = useCallback((e: any) => {
    logger.error('MapLibre error details:', {
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
        pixelRatio={MAP.PIXEL_RATIO}
        maxZoom={MAP.MAX_ZOOM}
        minZoom={MAP.MIN_ZOOM}
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
            opacity: (format.textureIntensity || TEXTURE.DEFAULT_INTENSITY) / 100,
            filter: format.texture === 'canvas' ? 'contrast(120%) brightness(110%)' : 'none'
          }}
        />
      )}
    </div>
  );
}

