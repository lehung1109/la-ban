'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeolocationData } from '../types/compass';

export function useGeolocation() {
  const [data, setData] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
    error: null,
  });

  const refreshLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setData((prev) => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          accuracy: Math.round(pos.coords.accuracy),
          error: null,
        });
      },
      (err) => {
        setData((prev) => ({ ...prev, error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    refreshLocation();
    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setData({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
            accuracy: Math.round(pos.coords.accuracy),
            error: null,
          });
        },
        (err) => {
          setData((prev) => ({ ...prev, error: err.message }));
        },
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [refreshLocation]);

  return { ...data, refreshLocation };
}
