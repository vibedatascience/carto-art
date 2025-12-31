'use client';

import { useEffect, useState } from 'react';
import type { PosterLocation } from '@/types/poster';
import { reverseGeocode, nominatimResultToPosterLocation } from '@/lib/geocoding/nominatim';

export function useUserLocation(onLocationFound: (location: PosterLocation) => void) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocode(latitude, longitude);
          
          if (result) {
            const location = nominatimResultToPosterLocation(result);
            if (location) {
              onLocationFound(location);
            }
          }
        } catch (err) {
          console.error('Failed to reverse geocode user location:', err);
          setError('Failed to resolve address');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        if (err.code !== err.PERMISSION_DENIED) {
          console.warn('Geolocation error:', err.message);
          setError(err.message);
        }
      },
      { timeout: 10000 }
    );
  }, [onLocationFound]);

  return { error, isLoading };
}

