'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useDeviceOrientation() {
  const [heading, setHeading] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [roll, setRoll] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [requiresPermission, setRequiresPermission] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const sensorEventReceived = useRef(false);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    sensorEventReceived.current = true;
    setIsDesktop(false);

    // iOS WebKit compass heading
    if (
      'webkitCompassHeading' in e &&
      typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number'
    ) {
      const iosHeading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      if (iosHeading !== undefined && iosHeading !== null) {
        setHeading(iosHeading);
      }
      if ('webkitCompassAccuracy' in e) {
        setAccuracy((e as unknown as { webkitCompassAccuracy: number }).webkitCompassAccuracy);
      }
    } else if (e.alpha !== null && e.alpha !== undefined) {
      // Android: alpha is counter-clockwise [0, 360)
      const androidHeading = (360 - e.alpha) % 360;
      setHeading(androidHeading);
    }

    if (e.beta !== null && e.beta !== undefined) {
      setPitch(e.beta);
    }
    if (e.gamma !== null && e.gamma !== undefined) {
      setRoll(e.gamma);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === 'granted') {
          setHasPermission(true);
          setRequiresPermission(false);
          window.addEventListener('deviceorientation', handleOrientation, true);
          return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  }, [handleOrientation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      setRequiresPermission(true);
    } else {
      setHasPermission(true);
      const win = window as any;
      if ('ondeviceorientationabsolute' in win) {
        win.addEventListener('deviceorientationabsolute', handleOrientation, true);
      } else if ('ondeviceorientation' in win) {
        win.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    const timer = setTimeout(() => {
      if (!sensorEventReceived.current) {
        setIsDesktop(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      const win = window as any;
      win.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      win.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  return {
    heading,
    pitch,
    roll,
    accuracy,
    isDesktop,
    requiresPermission,
    hasPermission,
    requestPermission,
    setManualHeading: setHeading,
    setManualPitch: setPitch,
    setManualRoll: setRoll,
  };
}
