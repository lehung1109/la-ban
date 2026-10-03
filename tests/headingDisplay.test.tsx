import React from 'react';
import { describe, it, expect, vi } from 'vitest';
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
  it('renders heading degrees and cardinal direction in Vietnamese', () => {
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
