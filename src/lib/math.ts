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
  let d = Math.floor(absolute);
  const minutesNotTruncated = (absolute - d) * 60;
  let m = Math.floor(minutesNotTruncated);
  let s = Math.floor((minutesNotTruncated - m) * 60);

  if (s === 60) {
    s = 0;
    m += 1;
  }
  if (m === 60) {
    m = 0;
    d += 1;
  }

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
  const angle = Math.sqrt(roll * roll + pitch * pitch);
  const scale = 2.0;
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
