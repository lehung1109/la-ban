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
