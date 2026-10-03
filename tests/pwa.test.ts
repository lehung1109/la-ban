import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Service Worker', () => {
  it('verifies manifest.json exists and contains standalone display', () => {
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(content.display).toBe('standalone');
    expect(content.theme_color).toBe('#000000');
    expect(content.background_color).toBe('#000000');
  });

  it('verifies sw.js exists and registers cache listeners', () => {
    const swPath = path.resolve(__dirname, '../public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('install');
    expect(swContent).toContain('fetch');
  });

  it('verifies icon.svg exists', () => {
    const iconPath = path.resolve(__dirname, '../public/icon.svg');
    expect(fs.existsSync(iconPath)).toBe(true);
  });
});
