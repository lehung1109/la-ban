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
