'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { smoothHeading } from '../lib/math';
import { useHapticAudio } from '../hooks/useHapticAudio';

interface CompassContextType {
  heading: number;
  pitch: number;
  roll: number;
  accuracy: number | null;
  targetBearing: number | null;
  isLocked: boolean;
  isDesktop: boolean;
  requiresPermission: boolean;
  requestPermission: () => Promise<boolean>;
  toggleBearingLock: () => void;
  setHeading: (deg: number) => void;
  setPitch: (pitch: number) => void;
  setRoll: (roll: number) => void;
}

const CompassContext = createContext<CompassContextType | undefined>(undefined);

export function CompassProvider({ children }: { children: React.ReactNode }) {
  const sensor = useDeviceOrientation();
  const [smoothedHeading, setSmoothedHeading] = useState(0);
  const [targetBearing, setTargetBearing] = useState<number | null>(null);
  const { playTickSound, triggerHaptic } = useHapticAudio();
  const lastTickDegRef = useRef<number>(0);

  // Animation frame smoothing loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      setSmoothedHeading((prev) => {
        const next = smoothHeading(prev, sensor.heading, 0.18);
        const rounded = Math.round(next);

        // Tick on each 5-degree mark change
        if (Math.abs(rounded - lastTickDegRef.current) >= 5) {
          lastTickDegRef.current = rounded;
          playTickSound();
          if (rounded % 90 === 0) {
            triggerHaptic(20); // Cardinal point vibration
          }
        }
        return next;
      });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [sensor.heading, playTickSound, triggerHaptic]);

  const toggleBearingLock = () => {
    if (targetBearing !== null) {
      setTargetBearing(null);
    } else {
      setTargetBearing(Math.round(smoothedHeading));
      triggerHaptic(30);
    }
  };

  return (
    <CompassContext.Provider
      value={{
        heading: smoothedHeading,
        pitch: sensor.pitch,
        roll: sensor.roll,
        accuracy: sensor.accuracy,
        targetBearing,
        isLocked: targetBearing !== null,
        isDesktop: sensor.isDesktop,
        requiresPermission: sensor.requiresPermission,
        requestPermission: sensor.requestPermission,
        toggleBearingLock,
        setHeading: sensor.setManualHeading,
        setPitch: sensor.setManualPitch,
        setRoll: sensor.setManualRoll,
      }}
    >
      {children}
    </CompassContext.Provider>
  );
}

export function useCompass() {
  const context = useContext(CompassContext);
  if (!context) {
    throw new Error('useCompass must be used within CompassProvider');
  }
  return context;
}
