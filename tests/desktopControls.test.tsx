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
