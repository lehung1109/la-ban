'use client';

import React, { createContext, useContext } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { GeolocationData } from '../types/compass';

interface LocationContextType extends GeolocationData {
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const geo = useGeolocation();
  return <LocationContext.Provider value={geo}>{children}</LocationContext.Provider>;
}

export function useLocationData() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationData must be used within LocationProvider');
  }
  return context;
}
