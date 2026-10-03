'use client';

import React, { useEffect } from 'react';
import { useCompass } from '../context/CompassContext';
import { useLocale } from '../context/LocaleContext';
import { RotateCw, Compass } from 'lucide-react';

export function DesktopControls() {
  const { heading, setHeading, isDesktop } = useCompass();
  const { t } = useLocale();

  // Keyboard shortcut listener for Left/Right arrow keys
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        setHeading((((heading - step) % 360) + 360) % 360);
      } else if (e.key === 'ArrowRight') {
        setHeading((heading + step) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, heading, setHeading]);

  if (!isDesktop) return null;

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col space-y-3 select-none">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-compass-orange" />
          <span>{t.simulatorHint}</span>
        </div>
        <button
          onClick={() => setHeading(0)}
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300 transition-colors"
        >
          <RotateCw className="w-3 h-3 text-compass-orange" />
          <span>0° Bắc</span>
        </button>
      </div>

      <input
        type="range"
        min="0"
        max="359"
        value={Math.round(heading)}
        onChange={(e) => setHeading(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-compass-orange"
        aria-label="Compass heading slider"
      />
    </div>
  );
}
