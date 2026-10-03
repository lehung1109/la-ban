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

  it('calculates bearing difference across 0/360 boundary', () => {
    const lockedBearing = 5;
    const currentHeading = 355;
    const diff = getShortestAngleDelta(currentHeading, lockedBearing);
    expect(diff).toBe(-10); // deviated 10 degrees left
  });
});
