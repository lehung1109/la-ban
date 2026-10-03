'use client';

import React from 'react';
import { useCompass } from '../context/CompassContext';
import { useLocale } from '../context/LocaleContext';
import { getCardinalDirection, getShortestAngleDelta } from '../lib/math';

export function HeadingDisplay() {
  const { heading, targetBearing, isLocked, toggleBearingLock } = useCompass();
  const { lang, t } = useLocale();

  const roundedHeading = Math.round(heading);
  const cardinal = getCardinalDirection(roundedHeading, lang);

  let deviationText: string | null = null;
  if (isLocked && targetBearing !== null) {
    const diff = Math.round(getShortestAngleDelta(roundedHeading, targetBearing));
    if (diff === 0) {
      deviationText = lang === 'vi' ? '0° (Chuẩn hướng)' : '0° (Aligned)';
    } else if (diff > 0) {
      deviationText = lang === 'vi' ? `+${diff}° (Lệch phải)` : `+${diff}° (Right)`;
    } else {
      deviationText = lang === 'vi' ? `${diff}° (Lệch trái)` : `${diff}° (Left)`;
    }
  }

  return (
    <div
      onClick={toggleBearingLock}
      className="flex flex-col items-center justify-center cursor-pointer py-2 select-none group"
      title={isLocked ? t.unlock : t.tapToLock}
    >
      <div className="flex items-baseline space-x-2">
        <span className="text-6xl font-extralight tracking-tight font-mono text-white tabular-nums">
          {roundedHeading}°
        </span>
        <span className="text-3xl font-light text-compass-orange">
          {cardinal.code}
        </span>
      </div>
      <div className="text-sm font-medium text-zinc-400 mt-1">
        {cardinal.name}
      </div>

      {isLocked && targetBearing !== null ? (
        <div className="mt-2 px-3 py-0.5 rounded-full bg-compass-red/20 border border-compass-red/50 text-xs text-compass-red font-mono animate-pulse">
          🎯 {t.locked}: {targetBearing}° | {deviationText}
        </div>
      ) : (
        <div className="text-[11px] text-zinc-600 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {t.tapToLock}
        </div>
      )}
    </div>
  );
}
