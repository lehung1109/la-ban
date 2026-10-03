'use client';

import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import { useCompass } from '../context/CompassContext';
import { SettingsModal } from './SettingsModal';
import { Settings, Globe } from 'lucide-react';

export function Header() {
  const { lang, toggleLang, t } = useLocale();
  const { isDesktop } = useCompass();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="w-full flex items-center justify-between px-5 py-3 border-b border-zinc-900 select-none">
        <button
          onClick={toggleLang}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-compass-orange" />
          <span>{lang.toUpperCase()}</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
            {t.appTitle}
          </span>
          {isDesktop && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-mono">
              {t.simulator}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          title={t.settings}
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
