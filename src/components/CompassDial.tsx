'use client';

import React, { useMemo } from 'react';
import { useCompass } from '../context/CompassContext';
import { BubbleLevel } from './BubbleLevel';

export function CompassDial() {
  const { heading, pitch, roll, targetBearing, isLocked, toggleBearingLock } = useCompass();

  // Generate 360 degree tick marks (every 2 degrees)
  const ticks = useMemo(() => {
    const list = [];
    for (let deg = 0; deg < 360; deg += 2) {
      const isMajor = deg % 30 === 0;
      const isMedium = deg % 10 === 0 && !isMajor;
      const isCardinal = deg === 0 || deg === 90 || deg === 180 || deg === 270;

      let length = 6;
      let stroke = '#52525b';
      let strokeWidth = 1;

      if (isMajor) {
        length = 14;
        stroke = isCardinal && deg === 0 ? '#FF9500' : '#ffffff';
        strokeWidth = 2;
      } else if (isMedium) {
        length = 10;
        stroke = '#a1a1aa';
        strokeWidth = 1.5;
      }

      list.push({
        deg,
        length,
        stroke,
        strokeWidth,
        isMajor,
        label: isMajor ? String(deg) : null,
        cardinal:
          deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : null,
      });
    }
    return list;
  }, []);

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto flex items-center justify-center">
      {/* Top Fixed Needle Pointer */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="w-0.5 h-4 bg-compass-orange shadow-[0_0_8px_#FF9500]" />
        <div className="w-2.5 h-2.5 bg-compass-orange rotate-45 -mt-1 shadow-[0_0_8px_#FF9500]" />
      </div>

      <svg
        viewBox="0 0 400 400"
        className="w-full h-full select-none cursor-pointer"
        onClick={toggleBearingLock}
      >
        <defs>
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#08080a" />
            <stop offset="98%" stopColor="#141418" />
            <stop offset="100%" stopColor="#27272a" />
          </radialGradient>
        </defs>

        {/* Dial Background circle */}
        <circle cx="200" cy="200" r="192" fill="url(#dialGrad)" stroke="#27272a" strokeWidth="2" />

        {/* ROTATING GROUP */}
        <g
          style={{
            transformOrigin: '200px 200px',
            transform: `rotate(${-heading}deg)`,
            transition: 'transform 0.05s linear',
          }}
        >
          {/* Locked target bearing marker */}
          {isLocked && targetBearing !== null && (
            <g>
              <line
                x1="200"
                y1="8"
                x2="200"
                y2="40"
                stroke="#FF3B30"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${targetBearing} 200 200)`}
              />
              <circle
                cx="200"
                cy="44"
                r="3"
                fill="#FF3B30"
                transform={`rotate(${targetBearing} 200 200)`}
              />
            </g>
          )}

          {/* Ticks & Labels */}
          {ticks.map((tick) => {
            const y2 = 12 + tick.length;
            return (
              <g key={tick.deg} transform={`rotate(${tick.deg} 200 200)`}>
                <line
                  x1="200"
                  y1="12"
                  x2="200"
                  y2={y2}
                  stroke={tick.stroke}
                  strokeWidth={tick.strokeWidth}
                  strokeLinecap="round"
                />

                {/* Major numbers */}
                {tick.label && !tick.cardinal && (
                  <text
                    x="200"
                    y="46"
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    {tick.label}
                  </text>
                )}

                {/* Cardinal Letters */}
                {tick.cardinal && (
                  <text
                    x="200"
                    y="48"
                    textAnchor="middle"
                    fill={tick.cardinal === 'N' ? '#FF9500' : '#ffffff'}
                    fontSize="16"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {tick.cardinal}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* STATIONARY LEVEL AT CENTER */}
        <BubbleLevel pitch={pitch} roll={roll} />
      </svg>
    </div>
  );
}
