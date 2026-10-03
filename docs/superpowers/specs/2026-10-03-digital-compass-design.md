# Technical Design Specification: Next.js Digital Compass (La Bàn Số)

- **Date:** 2026-10-03
- **Status:** Approved
- **Target Platform:** Web (Mobile-first PWA & Desktop Fallback)
- **Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons

---

## 1. Overview & Goals

The goal is to build a high-performance, precision digital compass web application inspired by the iconic Apple Compass interface. The application runs smoothly in mobile web browsers (iOS Safari, Android Chrome), offers full offline functionality as a Progressive Web App (PWA), and includes an interactive desktop simulation mode with mouse/wheel controls.

### Key Capabilities
- **Precision 360° Compass Dial:** Ultra-sharp SVG rendering with hardware-accelerated CSS transforms for continuous 60-120fps rotation.
- **Dual-Platform Motion Sensor Integration:** Comprehensive support for iOS (`webkitCompassHeading`, permission workflow) and Android (`deviceorientationabsolute` / `deviceorientation`).
- **Mathematical Anti-Jitter & Shortest-Path Interpolation:** Exponential smoothing (EMA) and wrap-around calculation across the $0^\circ \leftrightarrow 360^\circ$ boundary to eliminate sensor jitter.
- **Integrated Bubble Inclinometer (Level):** Dual concentric circles at dial center measuring pitch and roll to indicate surface levelness.
- **Bearing Lock (Heading Hold):** Tap-to-lock heading functionality with a dynamic deviation arc.
- **Location & Elevation Telemetry:** Geolocation integration displaying latitude, longitude (in DMS and decimal format), altitude, and accuracy estimate.
- **Desktop Simulator:** Interactive drag-to-rotate, mouse wheel, and keyboard controls when no hardware orientation sensors exist.
- **Bilingual Interface:** Instant client-side switching between Vietnamese (Tiếng Việt) and English without page reload.
- **PWA 100% Offline Capability:** Web App Manifest and Service Worker caching for complete offline functionality outdoors.
- **Haptic & Sound Feedback:** Subtle vibration bursts on cardial directions and mechanical click audio via Web Audio API.

---

## 2. Architecture & Technology Stack

### 2.1 Framework & Core Libraries
- **Next.js 15+ (App Router):** Fast SSR page shell for metadata and SEO, hosting Client Components for real-time hardware interaction.
- **React 19:** Utilizing modern hooks and state primitives.
- **TypeScript:** Strict type safety across sensor payloads, math utilities, and localization dictionaries.
- **Tailwind CSS:** OLED dark theme (`#000000`, high-contrast white `#FFFFFF`, accent orange `#FF9500`, warning red `#EF4444`).
- **Lucide React:** Lightweight vector icons.

### 2.2 Directory Structure
```
F:\projects\la-ban/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon-maskable.png
│   └── sounds/
│       └── tick.mp3 (optional fallback, Web Audio synthesized by default)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── manifest.ts
│   ├── components/
│   │   ├── Header.tsx             # Language toggle, Settings button, Simulator badge
│   │   ├── HeadingDisplay.tsx     # Current degree, cardinal direction, bearing deviation
│   │   ├── CompassDial.tsx        # Rotating SVG dial, tick marks, cardinal labels, needle
│   │   ├── BubbleLevel.tsx        # Center pitch/roll bubble indicator
│   │   ├── LocationBar.tsx        # GPS coordinates, elevation, accuracy
│   │   ├── DesktopControls.tsx    # Drag-to-rotate overlay, slider, keyboard helpers
│   │   ├── SettingsModal.tsx      # Toggles for audio, haptics, permission guide, calibration
│   │   └── PermissionBanner.tsx   # iOS Safari / Android sensor request banner
│   ├── context/
│   │   ├── CompassContext.tsx     # Compass heading, tilt, smoothing, calibration state
│   │   ├── LocationContext.tsx    # GPS coordinates, altitude, accuracy
│   │   ├── LocaleContext.tsx      # Language dictionary (VI / EN)
│   │   └── SettingsContext.tsx    # Haptics, sound preferences, coordinate format
│   ├── hooks/
│   │   ├── useDeviceOrientation.ts# iOS & Android sensor listener & permission requester
│   │   ├── useGeolocation.ts      # Geolocation watchPosition hook
│   │   ├── useCompassAnimation.ts # requestAnimationFrame smoothing loop
│   │   └── useHapticAudio.ts      # Web Audio tick synthesis & navigator.vibrate
│   ├── lib/
│   │   ├── math.ts                # Shortest angle diff, EMA smoothing, DMS formatter
│   │   ├── constants.ts           # Cardinal direction mappings, dial markings
│   │   └── i18n/
│   │       ├── vi.ts
│   │       └── en.ts
│   └── types/
│       ├── compass.ts
│       └── location.ts
├── docs/
│   └── superpowers/specs/
│       └── 2026-10-03-digital-compass-design.md
└── package.json
```

---

## 3. Detailed Component & UI Design

### 3.1 Layout & Visual Theme
- **Color Palette:**
  - Background: Pure Pitch Black (`#000000`).
  - Compass Dial Face: Deep Neutral Dark (`#0A0A0A` / `#141414`).
  - Major Ticks & Typography: Pure White (`#FFFFFF`).
  - Minor Ticks & Secondary Text: Muted Silver/Gray (`#8E8E93`).
  - North Indicator & Primary Accents: Apple Compass Orange (`#FF9500`).
  - Locked Bearing Target / Deviation: Neon Red (`#FF3B30`).
  - Bubble Level Aligned State: Electric Green (`#34C759`).
- **Typography:** System SF Pro / Inter font stack with tabular numbers (`tabular-nums`) to prevent text shifting during continuous updates.

### 3.2 UI Components

#### `Header.tsx`
- **Left:** Language Switcher button (`VI` / `EN`).
- **Center:** App Title ("LA BÀN" / "COMPASS") with dynamic mode indicator ("MÔ PHỎNG" / "SIMULATOR" when on desktop).
- **Right:** Settings modal trigger (gear icon).

#### `HeadingDisplay.tsx`
- **Primary Readout:** Prominent heading degree (e.g., `145°`) rendered in 54px bold font.
- **Direction Sub-label:** Cardinal / Intercardinal text (e.g., `ĐN` / `Đông Nam` or `SE` / `South-East`).
- **Bearing Lock Indicator:** When a target angle is locked, displays deviation with direction indicator (e.g., `◄ 12°` or `+12° lệch phải`).

#### `CompassDial.tsx`
- **SVG Structure:** Circular viewport `viewBox="0 0 400 400"`.
- **Dynamic Rotation:** The outer dial rotates by `-heading` degrees using CSS transform:
  ```css
  transform: rotateZ(-[heading]deg);
  will-change: transform;
  ```
- **Degree Markings:**
  - 180 tick lines spaced every 2 degrees around 360°.
  - Minor ticks (2°): length 6px, stroke 1px, muted gray.
  - Medium ticks (10°): length 10px, stroke 1.5px, bright gray.
  - Major ticks (30°): length 14px, stroke 2px, white.
  - Numeric labels every 30°: `0`, `30`, `60`, `90`, `120`, `150`, `180`, `210`, `240`, `270`, `300`, `330`.
  - Cardinal Letters: `N` at 0° (in `#FF9500`), `E` at 90°, `S` at 180°, `W` at 270°.
- **Fixed Center Overlay:**
  - Red/White central crosshair representing the target aim direction.
  - Bearing lock flag: tapping the dial sets `targetBearing = currentHeading`. A translucent red arc displays from `targetBearing` to `currentHeading`.

#### `BubbleLevel.tsx`
- Located directly in the dial's center.
- Outer stationary circle (radius 30px) and inner floating bubble circle (radius 12px).
- Offset calculation based on `pitch (beta)` and `roll (gamma)` clamped to maximum 24px radius:
  $$\text{distance} = \sqrt{\gamma^2 + \beta^2}$$
- When $\text{distance} \le 1.0^\circ$, the inner bubble snaps into center with a color shift to `#34C759` (True Level) and triggers a gentle haptic pulse.

#### `LocationBar.tsx`
- Latitude and Longitude displayed with high precision (e.g., `10°46'37" N  106°41'43" E`).
- Altitude: in meters (e.g., `12 m`).
- Accuracy radius: `±3 m`.
- Tap on coordinates to toggle between DMS (`10°46'37" N`) and Decimal (`10.776944°`).

#### `DesktopControls.tsx`
- Active only when device orientation sensors are absent.
- Provides intuitive controls:
  - Interactive mouse drag around the dial perimeter.
  - Horizontal range slider from 0° to 359°.
  - Left / Right arrow key listeners (step by 1° or 5° with Shift key).
  - Reset to North button.

---

## 4. Mathematical Modeling & Sensor Algorithms

### 4.1 Shortest Path Angle Difference
To avoid 360° spin glitches when passing North ($359^\circ \rightarrow 1^\circ$), the difference between target and current angles is calculated as:
```typescript
export function getShortestAngleDelta(target: number, current: number): number {
  return ((target - current + 540) % 360) - 180;
}
```

### 4.2 Exponential Moving Average (EMA) Smoothing
To prevent raw sensor jitter while maintaining zero perceived latency:
```typescript
export function smoothHeading(
  current: number,
  target: number,
  smoothingFactor: number = 0.18
): number {
  const delta = getShortestAngleDelta(target, current);
  // Deadband threshold: ignore micro-tremors below 0.2 degrees
  if (Math.abs(delta) < 0.2) {
    return current;
  }
  const next = (current + delta * smoothingFactor) % 360;
  return next < 0 ? next + 360 : next;
}
```

### 4.3 Heading Computation by Platform
1. **iOS Safari:**
   - Property: `(event as any).webkitCompassHeading`.
   - Direct magnetic heading value from 0° to 360° clockwise.
2. **Android Web:**
   - Event: `deviceorientationabsolute` (preferred) or `deviceorientation` with `event.absolute === true`.
   - Alpha calculation: $heading = (360 - event.alpha) \pmod{360}$.
   - Tilt compensation applied when device is held at an angle.
3. **Desktop Simulator:**
   - Drag calculation: $\theta = \left(\text{atan2}(y - cy, x - cx) \times \frac{180}{\pi} + 90\right) \pmod{360}$.

---

## 5. Offline & PWA Strategy

- **Service Worker (`sw.js`):**
  - Cache-first strategy for static core bundle, fonts, and assets.
  - Background sync when network returns for reverse geocoding if enabled.
- **Manifest (`manifest.json`):**
  - `start_url: "/"`
  - `display: "standalone"`
  - `orientation: "portrait-primary"`
  - `theme_color: "#000000"`
  - `background_color: "#000000"`

---

## 6. Error Handling & Edge Cases

| Scenario | System Behavior |
|----------|-----------------|
| **iOS Permission Denied** | Display clean modal explaining why permission is required, with button to re-trigger prompt or switch to desktop manual mode. |
| **GPS Unavailable or Denied** | Compass orientation continues seamlessly; location card displays "GPS Unavailable" without blocking compass. |
| **Magnetic Interference** | Detect `webkitCompassAccuracy > 15°` or irregular orientation jumps; display "Cần hiệu chỉnh" (Calibration Needed) banner with figure-8 animation. |
| **Window Resize / Device Rotation** | Responsive layout dynamically scales dial radius to fit screen height without vertical scrolling. |

---

## 7. Testing & Verification Plan

### 7.1 Unit Tests (Vitest / Jest)
- `math.test.ts`:
  - Verify `getShortestAngleDelta(1, 359)` returns `+2`, not `-358`.
  - Verify `getShortestAngleDelta(359, 1)` returns `-2`, not `+358`.
  - Verify `smoothHeading` converges accurately without overshoot.
  - Verify coordinate conversion to DMS format ($10.7769^\circ \rightarrow 10^\circ46'37''\text{ N}$).
  - Verify cardinal direction resolver ($0^\circ \rightarrow \text{N}$, $45^\circ \rightarrow \text{NE}$, etc.).

### 7.2 Component & Integration Tests
- Render `CompassDial` and assert SVG ticks and cardinal labels are correctly created.
- Test language switching changes UI labels instantly.
- Test Bearing Lock activation and deviation recalculation.
- Test Desktop Controls smoothly update heading state.

### 7.3 Manual End-to-End Verification
- Test in desktop browser with mouse drag and keyboard shortcuts.
- Verify PWA installability and offline functionality in airplane mode.
