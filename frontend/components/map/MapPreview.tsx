'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import Map, { type MapRef, Marker } from 'react-map-gl/maplibre';
import type { PosterLocation, LayerToggle, PosterConfig } from '@/types/poster';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MarkerIcon } from './MarkerIcon';

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
  markerColor = '#ef4444', 
  onMapLoad, 
  onMove 
  , layers, layerToggles
}: MapPreviewProps) {
  const mapRef = useRef<MapRef>(null);

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
    if (mapRef.current && onMapLoad) {
      const map = mapRef.current.getMap();
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const handleMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
    if (onMove) {
      onMove([evt.viewState.longitude, evt.viewState.latitude], evt.viewState.zoom);
    }
  }, [onMove]);

  const handleError = useCallback((e: any) => {
    console.error('MapLibre error details:', {
      message: e.error?.message || e.message || 'Unknown map error',
      error: e.error,
      originalEvent: e
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layers || !layerToggles?.length) return;
    const map = mapRef.current.getMap();
    if (!map) return;

    const applyLayers = () => {
      layerToggles.forEach(toggle => {
        const isVisible = layers[toggle.id as keyof PosterConfig['layers']];
        const labelScale = layers.labelSize || 1;
        
        toggle.layerIds.forEach(layerId => {
          if (!map.getLayer(layerId)) return;
          
          // Apply visibility
          map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');

          // If it's the labels toggle, also apply scale
          if (toggle.id === 'labels' && isVisible) {
            const layer = map.getLayer(layerId);
            if (layer && layer.type === 'symbol') {
              // We need to get the original text-size to scale it, 
              // but MapLibre doesn't make it easy to get the *unresolved* value easily 
              // from the layer object in a way that we can just multiply it.
              // For now, we'll apply a base size scaled by our factor.
              // A better approach would be to have the style use a variable, 
              // but MapLibre doesn't support that directly in layout properties.
              
              // Standard sizes for our styles: base 16 at zoom 12
              map.setLayoutProperty(layerId, 'text-size', [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 10 * labelScale,
                12, 16 * labelScale,
                16, 24 * labelScale
              ]);
            }
          }
        });
      });
    };

    if (map.isStyleLoaded()) {
      applyLayers();
    } else {
      map.once('styledata', applyLayers);
    }

    return () => {
      map.off('styledata', applyLayers);
    };
  }, [layers, layerToggles, mapStyle]);

  return (
    <div className="relative w-full h-full">
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
      >
        {showMarker && (
          <Marker
            longitude={location.center[0]}
            latitude={location.center[1]}
            anchor="bottom"
          >
            <MarkerIcon 
              size={42} 
              color={markerColor}
              borderColor="white"
            />
          </Marker>
        )}
      </Map>

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

