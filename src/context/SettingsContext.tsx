'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (val: boolean) => void;
  useDmsFormat: boolean;
  setUseDmsFormat: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const [useDmsFormat, setUseDmsFormatState] = useState(true);

  useEffect(() => {
    const sound = localStorage.getItem('compass_sound');
    if (sound !== null) setSoundEnabledState(sound === 'true');
    const haptic = localStorage.getItem('compass_haptic');
    if (haptic !== null) setHapticEnabledState(haptic === 'true');
    const dms = localStorage.getItem('compass_dms');
    if (dms !== null) setUseDmsFormatState(dms === 'true');
  }, []);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    localStorage.setItem('compass_sound', String(val));
  };

  const setHapticEnabled = (val: boolean) => {
    setHapticEnabledState(val);
    localStorage.setItem('compass_haptic', String(val));
  };

  const setUseDmsFormat = (val: boolean) => {
    setUseDmsFormatState(val);
    localStorage.setItem('compass_dms', String(val));
  };

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        hapticEnabled,
        setHapticEnabled,
        useDmsFormat,
        setUseDmsFormat,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
