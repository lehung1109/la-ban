'use client';

import React from 'react';
import { useCompass } from '../context/CompassContext';
import { useLocale } from '../context/LocaleContext';
import { Compass } from 'lucide-react';

export function PermissionBanner() {
  const { requiresPermission, requestPermission } = useCompass();
  const { t } = useLocale();

  if (!requiresPermission) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-zinc-900 border border-compass-orange/50 rounded-2xl p-4 shadow-2xl flex flex-col space-y-3">
      <div className="flex items-start space-x-3">
        <Compass className="w-6 h-6 text-compass-orange shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">{t.permissionPromptTitle}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{t.permissionPromptDesc}</p>
        </div>
      </div>
      <button
        onClick={requestPermission}
        className="w-full py-2.5 rounded-xl bg-compass-orange text-black font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
      >
        {t.enableSensor}
      </button>
    </div>
  );
}
