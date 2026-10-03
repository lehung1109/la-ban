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
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (!audioCtxRef.current) return;

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
