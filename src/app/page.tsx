'use client';

import React from 'react';
import { LocaleProvider } from '../context/LocaleContext';
import { SettingsProvider } from '../context/SettingsContext';
import { CompassProvider } from '../context/CompassContext';
import { LocationProvider } from '../context/LocationContext';
import { Header } from '../components/Header';
import { HeadingDisplay } from '../components/HeadingDisplay';
import { CompassDial } from '../components/CompassDial';
import { LocationBar } from '../components/LocationBar';
import { DesktopControls } from '../components/DesktopControls';
import { PermissionBanner } from '../components/PermissionBanner';

export default function CompassApp() {
  return (
    <SettingsProvider>
      <LocaleProvider>
        <CompassProvider>
          <LocationProvider>
            <main className="flex flex-col h-screen max-w-md mx-auto justify-between p-2 pb-6">
              <Header />

              <div className="flex-1 flex flex-col items-center justify-center space-y-3 my-auto">
                <HeadingDisplay />
                <CompassDial />
              </div>

              <div className="w-full flex flex-col space-y-3">
                <DesktopControls />
                <LocationBar />
              </div>

              <PermissionBanner />
            </main>
          </LocationProvider>
        </CompassProvider>
      </LocaleProvider>
    </SettingsProvider>
  );
}
