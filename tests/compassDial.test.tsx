import React from 'react';
import { describe, it, expect, vi } from 'vitest';
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
  it('renders SVG dial container with 400x400 viewBox', () => {
    const { container } = render(
      <LocaleProvider>
        <CompassDial />
      </LocaleProvider>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 400 400');
  });

  it('renders the top orange needle indicator', () => {
    const { container } = render(
      <LocaleProvider>
        <CompassDial />
      </LocaleProvider>
    );

    const needle = container.querySelector('.bg-compass-orange');
    expect(needle).toBeDefined();
  });
});
