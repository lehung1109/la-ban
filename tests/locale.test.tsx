import React from 'react';
import { describe, it, expect, beforeEach, vi as vitestMock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../src/context/LocaleContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import { useHapticAudio } from '../src/hooks/useHapticAudio';
import { vi } from '../src/lib/i18n/vi';
import { en } from '../src/lib/i18n/en';

const localeWrapper = ({ children }: { children: React.ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
);

const settingsWrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

const combinedWrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <LocaleProvider>{children}</LocaleProvider>
  </SettingsProvider>
);

describe('LocaleContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to Vietnamese and allows toggling to English', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: localeWrapper });
    expect(result.current.lang).toBe('vi');
    expect(result.current.t.appTitle).toBe('La Bàn Số');

    act(() => {
      result.current.setLang('en');
    });

    expect(result.current.lang).toBe('en');
    expect(result.current.t.appTitle).toBe('Digital Compass');
    expect(localStorage.getItem('compass_locale')).toBe('en');
  });

  it('toggleLang toggles between vi and en', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: localeWrapper });
    expect(result.current.lang).toBe('vi');

    act(() => {
      result.current.toggleLang();
    });
    expect(result.current.lang).toBe('en');
    expect(result.current.t.appTitle).toBe('Digital Compass');

    act(() => {
      result.current.toggleLang();
    });
    expect(result.current.lang).toBe('vi');
    expect(result.current.t.appTitle).toBe('La Bàn Số');
  });

  it('restores locale from localStorage if available', () => {
    localStorage.setItem('compass_locale', 'en');
    const { result } = renderHook(() => useLocale(), { wrapper: localeWrapper });
    expect(result.current.lang).toBe('en');
    expect(result.current.t.appTitle).toBe('Digital Compass');
  });

  it('throws error when useLocale is used outside of LocaleProvider', () => {
    expect(() => {
      renderHook(() => useLocale());
    }).toThrow('useLocale must be used within a LocaleProvider');
  });

  it('has identical keys for vi and en dictionaries', () => {
    const viKeys = Object.keys(vi).sort();
    const enKeys = Object.keys(en).sort();
    expect(viKeys).toEqual(enKeys);
  });
});

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings and updates values', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: settingsWrapper });
    expect(result.current.soundEnabled).toBe(true);
    expect(result.current.hapticEnabled).toBe(true);
    expect(result.current.useDmsFormat).toBe(true);

    act(() => {
      result.current.setSoundEnabled(false);
      result.current.setHapticEnabled(false);
      result.current.setUseDmsFormat(false);
    });

    expect(result.current.soundEnabled).toBe(false);
    expect(result.current.hapticEnabled).toBe(false);
    expect(result.current.useDmsFormat).toBe(false);
    expect(localStorage.getItem('compass_sound')).toBe('false');
    expect(localStorage.getItem('compass_haptic')).toBe('false');
    expect(localStorage.getItem('compass_dms')).toBe('false');
  });

  it('restores settings from localStorage if available', () => {
    localStorage.setItem('compass_sound', 'false');
    localStorage.setItem('compass_haptic', 'false');
    localStorage.setItem('compass_dms', 'false');

    const { result } = renderHook(() => useSettings(), { wrapper: settingsWrapper });
    expect(result.current.soundEnabled).toBe(false);
    expect(result.current.hapticEnabled).toBe(false);
    expect(result.current.useDmsFormat).toBe(false);
  });

  it('throws error when useSettings is used outside of SettingsProvider', () => {
    expect(() => {
      renderHook(() => useSettings());
    }).toThrow('useSettings must be used within a SettingsProvider');
  });
});

describe('useHapticAudio', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('triggers vibration when haptics are enabled', () => {
    const vibrateMock = vitestMock.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useHapticAudio(), { wrapper: combinedWrapper });

    act(() => {
      result.current.triggerHaptic(20);
    });

    expect(vibrateMock).toHaveBeenCalledWith(20);
  });

  it('does not trigger vibration when haptics are disabled', () => {
    const vibrateMock = vitestMock.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(
      () => {
        const settings = useSettings();
        const hapticAudio = useHapticAudio();
        return { settings, hapticAudio };
      },
      { wrapper: combinedWrapper }
    );

    act(() => {
      result.current.settings.setHapticEnabled(false);
    });

    act(() => {
      result.current.hapticAudio.triggerHaptic(20);
    });

    expect(vibrateMock).not.toHaveBeenCalled();
  });

  it('plays tick sound when sound is enabled', () => {
    const mockStart = vitestMock.fn();
    const mockStop = vitestMock.fn();
    const mockSetValueAtTime = vitestMock.fn();
    const mockExponentialRamp = vitestMock.fn();
    const mockConnect = vitestMock.fn();

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: mockSetValueAtTime,
        exponentialRampToValueAtTime: mockExponentialRamp,
      },
      connect: mockConnect,
      start: mockStart,
      stop: mockStop,
    };

    const mockGain = {
      gain: {
        setValueAtTime: mockSetValueAtTime,
        exponentialRampToValueAtTime: mockExponentialRamp,
      },
      connect: mockConnect,
    };

    class MockAudioContext {
      state = 'running';
      currentTime = 0;
      destination = {};
      createOscillator = () => mockOscillator;
      createGain = () => mockGain;
      resume = vitestMock.fn();
    }

    (window as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    const { result } = renderHook(() => useHapticAudio(), { wrapper: combinedWrapper });

    act(() => {
      result.current.playTickSound();
    });

    expect(mockStart).toHaveBeenCalled();
    expect(mockStop).toHaveBeenCalled();
  });

  it('does not play tick sound when sound is disabled', () => {
    const mockAudioContext = vitestMock.fn();
    (window as unknown as { AudioContext: unknown }).AudioContext = mockAudioContext;

    const { result } = renderHook(
      () => {
        const settings = useSettings();
        const hapticAudio = useHapticAudio();
        return { settings, hapticAudio };
      },
      { wrapper: combinedWrapper }
    );

    act(() => {
      result.current.settings.setSoundEnabled(false);
    });

    act(() => {
      result.current.hapticAudio.playTickSound();
    });

    expect(mockAudioContext).not.toHaveBeenCalled();
  });

  it('resumes suspended AudioContext when playing tick sound', () => {
    const resumeMock = vitestMock.fn();
    class MockAudioContext {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      createOscillator = () => ({
        type: 'triangle',
        frequency: { setValueAtTime: vitestMock.fn(), exponentialRampToValueAtTime: vitestMock.fn() },
        connect: vitestMock.fn(),
        start: vitestMock.fn(),
        stop: vitestMock.fn(),
      });
      createGain = () => ({
        gain: { setValueAtTime: vitestMock.fn(), exponentialRampToValueAtTime: vitestMock.fn() },
        connect: vitestMock.fn(),
      });
      resume = resumeMock;
    }

    (window as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    const { result } = renderHook(() => useHapticAudio(), { wrapper: combinedWrapper });

    act(() => {
      result.current.playTickSound();
    });

    expect(resumeMock).toHaveBeenCalled();
  });

  it('handles vibrate and audio exceptions gracefully without throwing', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: () => {
        throw new Error('Vibration permission denied');
      },
      writable: true,
      configurable: true,
    });

    (window as unknown as { AudioContext: unknown }).AudioContext = function () {
      throw new Error('AudioContext creation blocked');
    };

    const { result } = renderHook(() => useHapticAudio(), { wrapper: combinedWrapper });

    expect(() => {
      act(() => {
        result.current.triggerHaptic(50);
        result.current.playTickSound();
      });
    }).not.toThrow();
  });
});
