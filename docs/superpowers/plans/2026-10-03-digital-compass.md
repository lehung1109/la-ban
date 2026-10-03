# Digital Compass (La Bàn Số) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a precision, Apple-style digital compass web application with 360° SVG dial, mobile sensor integration (iOS & Android), bubble level, GPS telemetry, desktop simulator, bilingual support (VI/EN), and 100% offline PWA capability.

**Architecture:** Next.js 15 App Router client-centric architecture with SVG and CSS hardware acceleration for smooth 60-120fps rotation, custom React hooks managing DeviceOrientation and Geolocation APIs with exponential smoothing (EMA) and wrap-around angle math, accompanied by a desktop mouse/drag simulator fallback and Web App Manifest / Service Worker for offline use.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest for unit testing.

**Spec:** `docs/superpowers/specs/2026-10-03-digital-compass-design.md`

## Global Constraints

- Platform: Web (Mobile Safari iOS 13+, Android Chrome, Desktop Chrome/Firefox/Edge/Safari).
- Framework: Next.js 15+ with App Router and React 19.
- Styling: Tailwind CSS, Dark Theme (`#000000` pitch black background, `#FF9500` accent orange).
- Sensors: iOS `webkitCompassHeading` with permission prompt, Android `deviceorientationabsolute`, fallback mouse/keyboard controls on desktop.
- No heavy external state or 3D engines (strictly zero Redux, zero Three.js).
- Offline: PWA compliant (`manifest.json` and service worker).

---

### Task 1: Project Scaffolding & Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: Node.js v26+, npm
- Produces: Runnable Next.js 15 application shell with Vitest testing environment configured.

- [ ] **Step 1: Write setup smoke test**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('Environment setup', () => {
  it('verifies test runner is operational', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Initialize Next.js project and dependencies**

Run in terminal:
```bash
npm init -y
npm install next@latest react@latest react-dom@latest lucide-react clsx tailwindmerge
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer vitest @vitejs/plugin-react jsdom
```

Configure `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Configure `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Configure `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        compass: {
          dark: '#000000',
          dial: '#0c0c0e',
          card: '#18181b',
          orange: '#FF9500',
          red: '#FF3B30',
          green: '#34C759',
          muted: '#8E8E93',
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

Configure `postcss.config.mjs`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Configure `next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

Configure `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  background-color: #000000;
  color: #ffffff;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
}
```

Configure `src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Bàn Số - Precision Digital Compass',
  description: 'La bàn định hướng kỹ thuật số chuẩn xác phong cách Apple Compass',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-black text-white antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
```

Configure `src/app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-compass-orange">La Bàn Số</h1>
    </main>
  );
}
```

Add test script to `package.json`:
`"test": "vitest run"`

- [ ] **Step 3: Run test to verify it passes**

Run: `npm run test`
Expected: PASS with 1 passed test.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json tailwind.config.ts postcss.config.mjs next.config.ts vitest.config.ts src/ tests/
git commit -m "chore: scaffold Next.js 15 project with Tailwind CSS and Vitest"
```

---

### Task 2: Math & Compass Core Algorithms (TDD)

**Files:**
- Create: `src/lib/math.ts`, `src/lib/constants.ts`, `src/types/compass.ts`
- Test: `tests/math.test.ts`

**Interfaces:**
- Consumes: Standard Math functions
- Produces:
  - `getShortestAngleDelta(target: number, current: number): number`
  - `smoothHeading(current: number, target: number, alpha?: number): number`
  - `formatDMS(degrees: number, isLatitude: boolean): string`
  - `getCardinalDirection(heading: number, lang: 'vi' | 'en'): { code: string; name: string }`
  - `calculateLevelOffset(pitch: number, roll: number, maxRadius: number): { x: number; y: number; angle: number }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/math.test.ts
import { describe, it, expect } from 'vitest';
import {
  getShortestAngleDelta,
  smoothHeading,
  formatDMS,
  getCardinalDirection,
  calculateLevelOffset,
} from '../src/lib/math';

describe('Math utilities for Digital Compass', () => {
  describe('getShortestAngleDelta', () => {
    it('calculates direct delta correctly', () => {
      expect(getShortestAngleDelta(90, 50)).toBe(40);
      expect(getShortestAngleDelta(50, 90)).toBe(-40);
    });

    it('handles wrapping across 0/360 boundary correctly', () => {
      expect(getShortestAngleDelta(1, 359)).toBe(2);
      expect(getShortestAngleDelta(359, 1)).toBe(-2);
      expect(getShortestAngleDelta(10, 350)).toBe(20);
      expect(getShortestAngleDelta(350, 10)).toBe(-20);
    });
  });

  describe('smoothHeading', () => {
    it('smoothly interpolates towards target angle', () => {
      const smoothed = smoothHeading(0, 10, 0.2);
      expect(smoothed).toBeCloseTo(2, 1);
    });

    it('interpolates correctly across 360 wrap-around', () => {
      const smoothed = smoothHeading(358, 2, 0.5);
      // Delta is +4 degrees, half is +2 degrees -> 360/0
      expect(smoothed).toBeCloseTo(0, 0);
    });

    it('preserves current angle if delta is below deadband threshold', () => {
      const smoothed = smoothHeading(100, 100.1, 0.2);
      expect(smoothed).toBe(100);
    });
  });

  describe('formatDMS', () => {
    it('formats latitude coordinates to degrees minutes seconds', () => {
      const formatted = formatDMS(10.776944, true);
      expect(formatted).toMatch(/10°\s*46'\s*3[67]" N/);
    });

    it('formats negative latitude as South', () => {
      const formatted = formatDMS(-33.8688, true);
      expect(formatted).toMatch(/33°\s*52'\s*7" S/);
    });

    it('formats longitude coordinates with East/West', () => {
      const formattedEast = formatDMS(106.695278, false);
      expect(formattedEast).toMatch(/106°\s*41'\s*4[23]" E/);

      const formattedWest = formatDMS(-122.4194, false);
      expect(formattedWest).toMatch(/122°\s*25'\s*9" W/);
    });
  });

  describe('getCardinalDirection', () => {
    it('identifies exact cardinal directions in Vietnamese and English', () => {
      expect(getCardinalDirection(0, 'vi')).toEqual({ code: 'B', name: 'Bắc' });
      expect(getCardinalDirection(0, 'en')).toEqual({ code: 'N', name: 'North' });
      expect(getCardinalDirection(90, 'vi')).toEqual({ code: 'Đ', name: 'Đông' });
      expect(getCardinalDirection(90, 'en')).toEqual({ code: 'E', name: 'East' });
      expect(getCardinalDirection(180, 'vi')).toEqual({ code: 'N', name: 'Nam' });
      expect(getCardinalDirection(180, 'en')).toEqual({ code: 'S', name: 'South' });
      expect(getCardinalDirection(270, 'vi')).toEqual({ code: 'T', name: 'Tây' });
      expect(getCardinalDirection(270, 'en')).toEqual({ code: 'W', name: 'West' });
    });

    it('identifies intercardinal directions (e.g. 45 -> Đông Bắc / North-East)', () => {
      expect(getCardinalDirection(45, 'vi').code).toBe('ĐB');
      expect(getCardinalDirection(45, 'en').code).toBe('NE');
      expect(getCardinalDirection(135, 'vi').code).toBe('ĐN');
      expect(getCardinalDirection(225, 'vi').code).toBe('TN');
      expect(getCardinalDirection(315, 'vi').code).toBe('TB');
    });
  });

  describe('calculateLevelOffset', () => {
    it('returns zero coordinates when device is flat', () => {
      const res = calculateLevelOffset(0, 0, 30);
      expect(res.x).toBe(0);
      expect(res.y).toBe(0);
      expect(res.angle).toBe(0);
    });

    it('clamps displacement within maxRadius', () => {
      const res = calculateLevelOffset(60, 60, 30);
      const distance = Math.sqrt(res.x * res.x + res.y * res.y);
      expect(distance).toBeLessThanOrEqual(30.01);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module '../src/lib/math'".

- [ ] **Step 3: Implement minimal math library and constants**

Create `src/types/compass.ts`:
```typescript
export interface CardinalInfo {
  code: string;
  name: string;
}

export interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  error: string | null;
}

export interface CompassState {
  heading: number;
  rawHeading: number;
  pitch: number;
  roll: number;
  accuracy: number | null;
  targetBearing: number | null;
  isLocked: boolean;
  isDesktop: boolean;
  hasPermission: boolean;
  isCalibrated: boolean;
}
```

Create `src/lib/constants.ts`:
```typescript
export const CARDINAL_DIRECTIONS = [
  { min: 337.5, max: 360, vi: { code: 'B', name: 'Bắc' }, en: { code: 'N', name: 'North' } },
  { min: 0, max: 22.5, vi: { code: 'B', name: 'Bắc' }, en: { code: 'N', name: 'North' } },
  { min: 22.5, max: 67.5, vi: { code: 'ĐB', name: 'Đông Bắc' }, en: { code: 'NE', name: 'North-East' } },
  { min: 67.5, max: 112.5, vi: { code: 'Đ', name: 'Đông' }, en: { code: 'E', name: 'East' } },
  { min: 112.5, max: 157.5, vi: { code: 'ĐN', name: 'Đông Nam' }, en: { code: 'SE', name: 'South-East' } },
  { min: 157.5, max: 202.5, vi: { code: 'N', name: 'Nam' }, en: { code: 'S', name: 'South' } },
  { min: 202.5, max: 247.5, vi: { code: 'TN', name: 'Tây Nam' }, en: { code: 'SW', name: 'South-West' } },
  { min: 247.5, max: 292.5, vi: { code: 'T', name: 'Tây' }, en: { code: 'W', name: 'West' } },
  { min: 292.5, max: 337.5, vi: { code: 'TB', name: 'Tây Bắc' }, en: { code: 'NW', name: 'North-West' } },
];
```

Create `src/lib/math.ts`:
```typescript
import { CARDINAL_DIRECTIONS } from './constants';
import { CardinalInfo } from '../types/compass';

export function getShortestAngleDelta(target: number, current: number): number {
  return ((target - current + 540) % 360) - 180;
}

export function smoothHeading(
  current: number,
  target: number,
  alpha: number = 0.18
): number {
  const delta = getShortestAngleDelta(target, current);
  if (Math.abs(delta) < 0.2) {
    return current;
  }
  let next = (current + delta * alpha) % 360;
  if (next < 0) next += 360;
  return next;
}

export function formatDMS(deg: number, isLatitude: boolean): string {
  const absolute = Math.abs(deg);
  const d = Math.floor(absolute);
  const minutesNotTruncated = (absolute - d) * 60;
  const m = Math.floor(minutesNotTruncated);
  const s = Math.round((minutesNotTruncated - m) * 60);

  let direction = '';
  if (isLatitude) {
    direction = deg >= 0 ? 'N' : 'S';
  } else {
    direction = deg >= 0 ? 'E' : 'W';
  }

  return `${d}° ${m}' ${s}" ${direction}`;
}

export function getCardinalDirection(heading: number, lang: 'vi' | 'en'): CardinalInfo {
  const normalized = ((heading % 360) + 360) % 360;
  for (const dir of CARDINAL_DIRECTIONS) {
    if (dir.min <= dir.max) {
      if (normalized >= dir.min && normalized < dir.max) {
        return dir[lang];
      }
    } else {
      if (normalized >= dir.min || normalized < dir.max) {
        return dir[lang];
      }
    }
  }
  return lang === 'vi' ? { code: 'B', name: 'Bắc' } : { code: 'N', name: 'North' };
}

export function calculateLevelOffset(
  pitch: number,
  roll: number,
  maxRadius: number
): { x: number; y: number; angle: number } {
  // pitch (beta): tilt front/back (-180 to 180)
  // roll (gamma): tilt left/right (-90 to 90)
  const angle = Math.sqrt(roll * roll + pitch * pitch);
  const scale = 2.0; // visual sensitivity multiplier
  const rawX = roll * scale;
  const rawY = pitch * scale;
  const rawDist = Math.sqrt(rawX * rawX + rawY * rawY);

  if (rawDist === 0) {
    return { x: 0, y: 0, angle: 0 };
  }

  const clampedDist = Math.min(rawDist, maxRadius);
  const ratio = clampedDist / rawDist;

  return {
    x: rawX * ratio,
    y: rawY * ratio,
    angle: Math.round(angle * 10) / 10,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS with all tests passing in `tests/math.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ src/types/ tests/math.test.ts
git commit -m "feat: implement mathematical formulas and tests for compass heading, smoothing, and level"
```

---

### Task 3: Localization (VI/EN) & Audio/Haptics System

**Files:**
- Create: `src/lib/i18n/vi.ts`, `src/lib/i18n/en.ts`, `src/context/LocaleContext.tsx`, `src/context/SettingsContext.tsx`, `src/hooks/useHapticAudio.ts`
- Test: `tests/locale.test.tsx`

**Interfaces:**
- Consumes: React Context, Web Audio API, `navigator.vibrate`
- Produces:
  - `useLocale()` hook giving `t` dictionary and `lang` ('vi' | 'en') with toggle function
  - `useSettings()` hook giving `soundEnabled`, `hapticEnabled`, `dmsFormat`
  - `useHapticAudio()` hook giving `playTickSound()` and `triggerHapticPulse(durationMs)`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/locale.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../src/context/LocaleContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
);

describe('LocaleContext', () => {
  it('defaults to Vietnamese and allows toggling to English', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });
    expect(result.current.lang).toBe('vi');
    expect(result.current.t.appTitle).toBe('La Bàn Số');

    act(() => {
      result.current.setLang('en');
    });

    expect(result.current.lang).toBe('en');
    expect(result.current.t.appTitle).toBe('Digital Compass');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module '../src/context/LocaleContext'".

- [ ] **Step 3: Implement i18n dictionaries and contexts**

Install `@testing-library/react` for React Hook testing:
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

Create `src/lib/i18n/vi.ts`:
```typescript
export const vi = {
  appTitle: 'La Bàn Số',
  simulator: 'Mô phỏng',
  simulatorHint: 'Kéo chuột hoặc lăn chuột để xoay la bàn',
  altitude: 'Độ cao',
  accuracy: 'Sai số',
  permissionPromptTitle: 'Yêu cầu quyền cảm biến',
  permissionPromptDesc: 'Để la bàn chỉ hướng chuẩn xác, vui lòng cấp quyền truy cập cảm biến chuyển động.',
  enableSensor: 'Bật cảm biến',
  settings: 'Cài đặt',
  sound: 'Âm thanh bánh cóc (Tick)',
  haptics: 'Rung phản hồi (Haptics)',
  coordinateFormat: 'Định dạng tọa độ (DMS / Thập phân)',
  calibrationHelp: 'Hướng dẫn cân chỉnh',
  calibrationDesc: 'Nếu hướng bị lệch, hãy cầm điện thoại vẽ hình số 8 trong không khí 3-5 lần.',
  close: 'Đóng',
  north: 'Bắc',
  east: 'Đông',
  south: 'Nam',
  west: 'Tây',
  deviation: 'Lệch',
  tapToLock: 'Chạm để khóa hướng',
  locked: 'Đã khóa hướng',
  unlock: 'Mở khóa',
  levelZero: 'Thăng bằng hoàn hảo',
  gpsUnavailable: 'Không có dữ liệu GPS',
};
```

Create `src/lib/i18n/en.ts`:
```typescript
export const en = {
  appTitle: 'Digital Compass',
  simulator: 'Simulator',
  simulatorHint: 'Click & drag or scroll mouse to rotate compass',
  altitude: 'Elevation',
  accuracy: 'Accuracy',
  permissionPromptTitle: 'Motion Sensor Access',
  permissionPromptDesc: 'To navigate accurately, please allow access to device motion and orientation sensors.',
  enableSensor: 'Enable Sensors',
  settings: 'Settings',
  sound: 'Mechanical Tick Sound',
  haptics: 'Haptic Feedback',
  coordinateFormat: 'Coordinate Format (DMS / Decimal)',
  calibrationHelp: 'Calibration Guide',
  calibrationDesc: 'If compass drifts, wave phone in a figure-8 motion 3-5 times.',
  close: 'Close',
  north: 'North',
  east: 'East',
  south: 'South',
  west: 'West',
  deviation: 'Deviation',
  tapToLock: 'Tap to lock bearing',
  locked: 'Bearing locked',
  unlock: 'Unlock',
  levelZero: 'True Level',
  gpsUnavailable: 'GPS Unavailable',
};

export type Translations = typeof vi;
```

Create `src/context/LocaleContext.tsx`:
```tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { vi } from '../lib/i18n/vi';
import { en, Translations } from '../lib/i18n/en';

type Language = 'vi' | 'en';

interface LocaleContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('compass_locale') as Language;
    if (saved === 'vi' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('compass_locale', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  const t = lang === 'vi' ? vi : (en as Translations);

  return (
    <LocaleContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
```

Create `src/context/SettingsContext.tsx`:
```tsx
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
```

Create `src/hooks/useHapticAudio.ts`:
```typescript
'use client';

import { useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

export function useHapticAudio() {
  const { soundEnabled, hapticEnabled } = useSettings();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTickSound = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  }, [soundEnabled]);

  const triggerHaptic = useCallback(
    (durationMs: number = 15) => {
      if (!hapticEnabled || typeof navigator === 'undefined') return;
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(durationMs);
        } catch {
          // ignore
        }
      }
    },
    [hapticEnabled]
  );

  return { playTickSound, triggerHaptic };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS with all tests passing in `tests/locale.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/ src/context/ src/hooks/ tests/locale.test.tsx
git commit -m "feat: implement i18n localization, settings context and haptic/audio hook"
```

---

### Task 4: Hardware Sensors & Motion Engine

**Files:**
- Create: `src/hooks/useDeviceOrientation.ts`, `src/hooks/useGeolocation.ts`, `src/context/CompassContext.tsx`, `src/context/LocationContext.tsx`
- Test: `tests/sensors.test.ts`

**Interfaces:**
- Consumes: Window DeviceOrientationEvent, Geolocation API, `math.ts`
- Produces:
  - `CompassContext` providing `heading`, `pitch`, `roll`, `targetBearing`, `setHeading`, `toggleBearingLock`, `isDesktop`
  - `LocationContext` providing `latitude`, `longitude`, `altitude`, `accuracy`, `refreshLocation`

- [ ] **Step 1: Write mock sensor integration test**

```typescript
// tests/sensors.test.ts
import { describe, it, expect } from 'vitest';
import { getShortestAngleDelta } from '../src/lib/math';

describe('Sensor angle calculations', () => {
  it('correctly maps android alpha to clockwise compass degrees', () => {
    // Android alpha is counter-clockwise 0-360
    const rawAlpha = 90;
    const heading = (360 - rawAlpha) % 360;
    expect(heading).toBe(270);
  });

  it('calculates bearing difference when locked', () => {
    const lockedBearing = 120;
    const currentHeading = 135;
    const diff = getShortestAngleDelta(currentHeading, lockedBearing);
    expect(diff).toBe(15); // deviated 15 degrees right
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 3: Implement sensor hooks and providers**

Create `src/hooks/useDeviceOrientation.ts`:
```typescript
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
    if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
      const iosHeading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      if (iosHeading !== undefined && iosHeading !== null) {
        setHeading(iosHeading);
      }
      if ('webkitCompassAccuracy' in e) {
        setAccuracy((e as unknown as { webkitCompassAccuracy: number }).webkitCompassAccuracy);
      }
    } else if (e.alpha !== null && e.alpha !== undefined) {
      // Android
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
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
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
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      setRequiresPermission(true);
    } else {
      setHasPermission(true);
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      } else if ('ondeviceorientation' in window) {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    const timer = setTimeout(() => {
      if (!sensorEventReceived.current) {
        setIsDesktop(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
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
```

Create `src/hooks/useGeolocation.ts`:
```typescript
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
```

Create `src/context/CompassContext.tsx`:
```tsx
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
            triggerHaptic(20); // Cardial point vibration
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
```

Create `src/context/LocationContext.tsx`:
```tsx
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
```

- [ ] **Step 4: Run tests to verify everything passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ src/context/ tests/sensors.test.ts
git commit -m "feat: implement device orientation, geolocation and compass state providers"
```

---

### Task 5: UI Components - HeadingDisplay & LocationBar

**Files:**
- Create: `src/components/HeadingDisplay.tsx`, `src/components/LocationBar.tsx`
- Test: `tests/headingDisplay.test.tsx`

**Interfaces:**
- Consumes: `useCompass`, `useLocale`, `useLocationData`, `useSettings`, `math.ts`
- Produces:
  - `<HeadingDisplay />`: Displays bold degrees, cardinal letters, bearing deviation.
  - `<LocationBar />`: Displays latitude/longitude in DMS or decimal, elevation, accuracy.

- [ ] **Step 1: Write the failing component test**

```tsx
// tests/headingDisplay.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadingDisplay } from '../src/components/HeadingDisplay';
import { LocaleProvider } from '../src/context/LocaleContext';
import { SettingsProvider } from '../src/context/SettingsContext';

// Mock CompassContext
vi.mock('../src/context/CompassContext', () => ({
  useCompass: () => ({
    heading: 90,
    targetBearing: null,
    isLocked: false,
    toggleBearingLock: vi.fn(),
  }),
}));

describe('HeadingDisplay Component', () => {
  it('renders heading degrees and cardinal direction', () => {
    render(
      <SettingsProvider>
        <LocaleProvider>
          <HeadingDisplay />
        </LocaleProvider>
      </SettingsProvider>
    );

    expect(screen.getByText('90°')).toBeDefined();
    expect(screen.getByText('Đông')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module '../src/components/HeadingDisplay'".

- [ ] **Step 3: Implement HeadingDisplay and LocationBar**

Create `src/components/HeadingDisplay.tsx`:
```tsx
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
      deviationText = '0° (Chuẩn hướng)';
    } else if (diff > 0) {
      deviationText = `+${diff}° (Lệch phải)`;
    } else {
      deviationText = `${diff}° (Lệch trái)`;
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
          🎯 Khóa: {targetBearing}° | {deviationText}
        </div>
      ) : (
        <div className="text-[11px] text-zinc-600 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {t.tapToLock}
        </div>
      )}
    </div>
  );
}
```

Create `src/components/LocationBar.tsx`:
```tsx
'use client';

import React from 'react';
import { useLocationData } from '../context/LocationContext';
import { useLocale } from '../context/LocaleContext';
import { useSettings } from '../context/SettingsContext';
import { formatDMS } from '../lib/math';
import { MapPin, Mountain, Crosshair } from 'lucide-react';

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
        className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-500 cursor-pointer hover:bg-zinc-800/80 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
        <span>{t.gpsUnavailable} • Nhấn để thử lại</span>
      </div>
    );
  }

  const latStr = useDmsFormat
    ? formatDMS(latitude, true)
    : `${latitude.toFixed(5)}° N`;
  const lngStr = useDmsFormat
    ? formatDMS(longitude, false)
    : `${longitude.toFixed(5)}° E`;

  return (
    <div
      onClick={toggleFormat}
      className="w-full max-w-sm mx-auto bg-zinc-900/80 backdrop-blur border border-zinc-800/80 rounded-2xl p-3 flex flex-col space-y-1.5 cursor-pointer hover:border-zinc-700 transition-all select-none"
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/HeadingDisplay.tsx src/components/LocationBar.tsx tests/headingDisplay.test.tsx
git commit -m "feat: implement HeadingDisplay and LocationBar telemetry components"
```

---

### Task 6: SVG Compass Dial & Bubble Level Inclinometer

**Files:**
- Create: `src/components/CompassDial.tsx`, `src/components/BubbleLevel.tsx`
- Test: `tests/compassDial.test.tsx`

**Interfaces:**
- Consumes: `useCompass`, `math.ts`
- Produces:
  - `<CompassDial />`: SVG dial with 360 degree ticks, cardinal letters, bearing indicator
  - `<BubbleLevel />`: Dynamic concentric circle level indicator

- [ ] **Step 1: Write component smoke test**

```tsx
// tests/compassDial.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CompassDial } from '../src/components/CompassDial';
import { LocaleProvider } from '../src/context/LocaleContext';

vi.mock('../src/context/CompassContext', () => ({
  useCompass: () => ({
    heading: 45,
    pitch: 0,
    roll: 0,
    targetBearing: null,
    isLocked: false,
    toggleBearingLock: vi.fn(),
  }),
}));

describe('CompassDial SVG Component', () => {
  it('renders SVG dial container', () => {
    const { container } = render(
      <LocaleProvider>
        <CompassDial />
      </LocaleProvider>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 400');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module '../src/components/CompassDial'".

- [ ] **Step 3: Implement BubbleLevel and CompassDial**

Create `src/components/BubbleLevel.tsx`:
```tsx
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
```

Create `src/components/CompassDial.tsx`:
```tsx
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
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className="w-0.5 h-4 bg-compass-orange shadow-[0_0_8px_#FF9500]" />
        <div className="w-2.5 h-2.5 bg-compass-orange rotate-45 -mt-1 shadow-[0_0_8px_#FF9500]" />
      </div>

      <svg
        viewBox="0 0 400 400"
        className="w-full h-full select-none"
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
          {/* Locked target bearing marker arc */}
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS with all tests passing in `tests/compassDial.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/components/CompassDial.tsx src/components/BubbleLevel.tsx tests/compassDial.test.tsx
git commit -m "feat: implement SVG compass dial with hardware accelerated transform and bubble level"
```

---

### Task 7: Desktop Simulator Controls, Header & Settings Modal

**Files:**
- Create: `src/components/Header.tsx`, `src/components/SettingsModal.tsx`, `src/components/DesktopControls.tsx`, `src/components/PermissionBanner.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/desktopControls.test.tsx`

**Interfaces:**
- Consumes: `useCompass`, `useLocale`, `useSettings`
- Produces:
  - `<Header />` with language switch, title, settings button
  - `<SettingsModal />` with sound/haptics toggle and calibration instructions
  - `<DesktopControls />` with mouse drag rotation and slider when on PC
  - `<PermissionBanner />` for iOS motion permission request

- [ ] **Step 1: Write test for DesktopControls interaction**

```tsx
// tests/desktopControls.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopControls } from '../src/components/DesktopControls';
import { LocaleProvider } from '../src/context/LocaleContext';

const mockSetHeading = vi.fn();

vi.mock('../src/context/CompassContext', () => ({
  useCompass: () => ({
    heading: 90,
    setHeading: mockSetHeading,
    isDesktop: true,
  }),
}));

describe('DesktopControls Component', () => {
  it('renders slider and updates heading when dragged', () => {
    render(
      <LocaleProvider>
        <DesktopControls />
      </LocaleProvider>
    );

    const slider = screen.getByRole('slider');
    expect(slider).toBeDefined();

    fireEvent.change(slider, { target: { value: '180' } });
    expect(mockSetHeading).toHaveBeenCalledWith(180);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module '../src/components/DesktopControls'".

- [ ] **Step 3: Implement components and integrate main page**

Create `src/components/SettingsModal.tsx`:
```tsx
'use client';

import React from 'react';
import { useLocale } from '../context/LocaleContext';
import { useSettings } from '../context/SettingsContext';
import { X, Volume2, Smartphone, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useLocale();
  const { soundEnabled, setSoundEnabled, hapticEnabled, setHapticEnabled } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-semibold text-white">{t.settings}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-compass-orange" />
              <span className="text-sm text-zinc-200">{t.sound}</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-compass-orange cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-compass-orange" />
              <span className="text-sm text-zinc-200">{t.haptics}</span>
            </div>
            <input
              type="checkbox"
              checked={hapticEnabled}
              onChange={(e) => setHapticEnabled(e.target.checked)}
              className="w-5 h-5 accent-compass-orange cursor-pointer"
            />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
            <HelpCircle className="w-4 h-4 text-compass-orange" />
            <span>{t.calibrationHelp}</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {t.calibrationDesc}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
}
```

Create `src/components/Header.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { useCompass } from '../context/CompassContext';
import { SettingsModal } from './SettingsModal';
import { Settings, Globe } from 'lucide-react';

export function Header() {
  const { lang, toggleLang, t } = useLocale();
  const { isDesktop } = useCompass();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="w-full flex items-center justify-between px-5 py-3 border-b border-zinc-900 select-none">
        <button
          onClick={toggleLang}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-compass-orange" />
          <span>{lang.toUpperCase()}</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
            {t.appTitle}
          </span>
          {isDesktop && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-mono">
              {t.simulator}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          title={t.settings}
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
```

Create `src/components/DesktopControls.tsx`:
```tsx
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
      />
    </div>
  );
}
```

Create `src/components/PermissionBanner.tsx`:
```tsx
'use client';

import React from 'react';
import { useCompass } from '../context/CompassContext';
import { useLocale } from '../context/LocaleContext';
import { Compass } from 'lucide-react';

export function PermissionBanner() {
  const { requiresPermission, requestPermission } = useCompass();
  const { t } = useLocale();

  if (!requiresPermission) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-zinc-900 border border-compass-orange/50 rounded-2xl p-4 shadow-2xl flex flex-col space-y-3">
      <div className="flex items-start space-x-3">
        <Compass className="w-6 h-6 text-compass-orange shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">{t.permissionPromptTitle}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{t.permissionPromptDesc}</p>
        </div>
      </div>
      <button
        onClick={requestPermission}
        className="w-full py-2.5 rounded-xl bg-compass-orange text-black font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
      >
        {t.enableSensor}
      </button>
    </div>
  );
}
```

Update `src/app/page.tsx`:
```tsx
'use client';

import React from 'react';
import { LocaleProvider } from '../context/LocaleContext';
import { SettingsProvider } from '../context/SettingsContext';
import { CompassProvider } from '../context/CompassContext';
import { LocationProvider } from '../context/LocationContext';
import { Header } from '../components/Header';
import { HeadingDisplay } from '../components/HeadingDisplay';
import { CompassDial } from '../components/CompassDial';
import { LocationBar } from '../components/LocationBar';
import { DesktopControls } from '../components/DesktopControls';
import { PermissionBanner } from '../components/PermissionBanner';

export default function CompassApp() {
  return (
    <SettingsProvider>
      <LocaleProvider>
        <CompassProvider>
          <LocationProvider>
            <main className="flex flex-col h-screen max-w-md mx-auto justify-between p-2 pb-6">
              <Header />

              <div className="flex-1 flex flex-col items-center justify-center space-y-3 my-auto">
                <HeadingDisplay />
                <CompassDial />
              </div>

              <div className="w-full flex flex-col space-y-3">
                <DesktopControls />
                <LocationBar />
              </div>

              <PermissionBanner />
            </main>
          </LocationProvider>
        </CompassProvider>
      </LocaleProvider>
    </SettingsProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS with all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/app/page.tsx tests/desktopControls.test.tsx
git commit -m "feat: implement DesktopControls, Header, SettingsModal and main App page assembly"
```

---

### Task 8: PWA & Offline Support (Manifest, Service Worker & Icons)

**Files:**
- Create: `public/manifest.json`, `public/sw.js`, `public/register-sw.js`, `public/icon.svg`
- Modify: `src/app/layout.tsx`
- Test: `tests/pwa.test.ts`

**Interfaces:**
- Consumes: Web App Manifest specification, ServiceWorker API
- Produces: Standalone installable PWA with full offline capabilities.

- [ ] **Step 1: Write PWA manifest validation test**

```typescript
// tests/pwa.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest', () => {
  it('verifies manifest.json exists and contains standalone display', () => {
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(content.display).toBe('standalone');
    expect(content.theme_color).toBe('#000000');
    expect(content.background_color).toBe('#000000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with manifest.json does not exist.

- [ ] **Step 3: Implement Manifest and Service Worker**

Create `public/manifest.json`:
```json
{
  "name": "La Bàn Số - Digital Compass",
  "short_name": "La Bàn",
  "description": "La bàn định hướng kỹ thuật số chuẩn xác phong cách Apple Compass",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "192x192 512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

Create `public/icon.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#000000" />
  <circle cx="256" cy="256" r="210" fill="#0c0c0e" stroke="#27272a" stroke-width="8" />
  <!-- North needle -->
  <polygon points="256,70 286,256 226,256" fill="#FF9500" />
  <!-- South needle -->
  <polygon points="256,442 286,256 226,256" fill="#FFFFFF" />
  <circle cx="256" cy="256" r="32" fill="#18181b" stroke="#FF9500" stroke-width="6" />
</svg>
```

Create `public/sw.js`:
```javascript
const CACHE_NAME = 'compass-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          return caches.match('/');
        })
      );
    })
  );
});
```

Register Service Worker in `src/app/layout.tsx`:
Add client script tag to register `/sw.js` safely in production or development:
```tsx
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Bàn Số - Precision Digital Compass',
  description: 'La bàn định hướng kỹ thuật số chuẩn xác phong cách Apple Compass',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'La Bàn',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-black text-white antialiased overflow-hidden select-none">
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS with 100% tests passing across all test suites.

- [ ] **Step 5: Run production build verification**

Run: `npm run build`
Expected: Next.js builds successfully with zero TypeScript or lint errors.

- [ ] **Step 6: Commit**

```bash
git add public/ src/app/layout.tsx tests/pwa.test.ts
git commit -m "feat: add PWA manifest, icon, service worker and layout integration"
```
