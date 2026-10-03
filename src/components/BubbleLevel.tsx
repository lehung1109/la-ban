'use client';

import React from 'react';
import { calculateLevelOffset } from '../lib/math';

interface BubbleLevelProps {
  pitch: number;
  roll: number;
}

export function BubbleLevel({ pitch, roll }: BubbleLevelProps) {
  const { x, y, angle } = calculateLevelOffset(pitch, roll, 28);
  const isLevel = angle <= 1.0;

  return (
    <g className="bubble-level select-none">
      {/* Outer target ring */}
      <circle
        cx="200"
        cy="200"
        r="28"
        fill="transparent"
        stroke={isLevel ? '#34C759' : '#3f3f46'}
        strokeWidth="1.5"
        strokeDasharray={isLevel ? 'none' : '4 4'}
        className="transition-colors duration-300"
      />

      {/* Crosshairs */}
      <line x1="192" y1="200" x2="208" y2="200" stroke={isLevel ? '#34C759' : '#71717a'} strokeWidth="1" />
      <line x1="200" y1="192" x2="200" y2="208" stroke={isLevel ? '#34C759' : '#71717a'} strokeWidth="1" />

      {/* Floating bubble */}
      <circle
        cx={200 + x}
        cy={200 + y}
        r="10"
        fill={isLevel ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 255, 255, 0.2)'}
        stroke={isLevel ? '#34C759' : '#ffffff'}
        strokeWidth="1.5"
        className="transition-all duration-75"
      />

      {/* Angle degree text */}
      <text
        x="200"
        y="242"
        textAnchor="middle"
        fill={isLevel ? '#34C759' : '#71717a'}
        fontSize="11"
        fontFamily="monospace"
        fontWeight="600"
      >
        {angle}°
      </text>
    </g>
  );
}
