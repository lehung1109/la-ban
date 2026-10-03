'use client';

import React from 'react';
import { useLocationData } from '../context/LocationContext';
import { useLocale } from '../context/LocaleContext';
import { useSettings } from '../context/SettingsContext';
import { formatDMS } from '../lib/math';
import { MapPin, Mountain, Crosshair, RefreshCw } from 'lucide-react';

export function LocationBar() {
  const { latitude, longitude, altitude, accuracy, error, refreshLocation } = useLocationData();
  const { t } = useLocale();
  const { useDmsFormat, setUseDmsFormat } = useSettings();

  const toggleFormat = () => {
    setUseDmsFormat(!useDmsFormat);
  };

  if (error || latitude === null || longitude === null) {
    return (
      <div
        onClick={refreshLocation}
        className="w-full max-w-sm mx-auto flex items-center justify-between py-3 px-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-500 cursor-pointer hover:bg-zinc-800/80 transition-colors select-none"
        title="Nhấn để cập nhật GPS"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          <span>{t.gpsUnavailable}</span>
        </div>
        <div className="flex items-center space-x-1 text-compass-orange">
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
          <span>Thử lại</span>
        </div>
      </div>
    );
  }

  const latStr = useDmsFormat
    ? formatDMS(latitude, true)
    : `${Math.abs(latitude).toFixed(5)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lngStr = useDmsFormat
    ? formatDMS(longitude, false)
    : `${Math.abs(longitude).toFixed(5)}° ${longitude >= 0 ? 'E' : 'W'}`;

  return (
    <div
      onClick={toggleFormat}
      className="w-full max-w-sm mx-auto bg-zinc-900/80 backdrop-blur border border-zinc-800/80 rounded-2xl p-3 flex flex-col space-y-1.5 cursor-pointer hover:border-zinc-700 transition-all select-none"
      title="Nhấn để chuyển đổi DMS / Thập phân"
    >
      <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-compass-orange shrink-0" />
          <span>{latStr}</span>
        </div>
        <span>{lngStr}</span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-sans border-t border-zinc-800/60 pt-1.5">
        <div className="flex items-center space-x-1">
          <Mountain className="w-3 h-3 text-zinc-400" />
          <span>
            {t.altitude}:{' '}
            <strong className="text-zinc-300 font-mono">
              {altitude !== null ? `${altitude} m` : '--'}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Crosshair className="w-3 h-3 text-zinc-400" />
          <span>
            {t.accuracy}:{' '}
            <strong className="text-zinc-300 font-mono">
              {accuracy !== null ? `±${accuracy} m` : '--'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
