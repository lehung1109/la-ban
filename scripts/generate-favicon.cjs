const fs = require('fs');
const path = require('path');

// 1. Generate rich high-resolution SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="65%" stop-color="#09090b" />
      <stop offset="95%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#27272a" />
    </radialGradient>
    <linearGradient id="northLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA826" />
      <stop offset="100%" stop-color="#FF9500" />
    </linearGradient>
    <linearGradient id="northRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E07A00" />
      <stop offset="100%" stop-color="#C76800" />
    </linearGradient>
    <linearGradient id="southLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E4E4E7" />
    </linearGradient>
    <linearGradient id="southRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4D4D8" />
      <stop offset="100%" stop-color="#A1A1AA" />
    </linearGradient>
    <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Background Squircle / App Icon Badge -->
  <rect width="512" height="512" rx="120" fill="#000000" />
  
  <!-- Outer Bezel -->
  <circle cx="256" cy="256" r="224" fill="url(#bgGrad)" stroke="#3f3f46" stroke-width="8" />
  <circle cx="256" cy="256" r="200" fill="none" stroke="#27272a" stroke-width="3" stroke-dasharray="4 8" />

  <!-- Cardinal Tick Marks -->
  <line x1="256" y1="48" x2="256" y2="76" stroke="#FF9500" stroke-width="8" stroke-linecap="round" />
  <line x1="256" y1="436" x2="256" y2="464" stroke="#71717a" stroke-width="8" stroke-linecap="round" />
  <line x1="436" y1="256" x2="464" y2="256" stroke="#71717a" stroke-width="8" stroke-linecap="round" />
  <line x1="48" y1="256" x2="76" y2="256" stroke="#71717a" stroke-width="8" stroke-linecap="round" />

  <!-- Diagonal Sub-ticks -->
  <line x1="109" y1="109" x2="126" y2="126" stroke="#3f3f46" stroke-width="5" stroke-linecap="round" />
  <line x1="403" y1="109" x2="386" y2="126" stroke="#3f3f46" stroke-width="5" stroke-linecap="round" />
  <line x1="403" y1="403" x2="386" y2="386" stroke="#3f3f46" stroke-width="5" stroke-linecap="round" />
  <line x1="109" y1="403" x2="126" y2="386" stroke="#3f3f46" stroke-width="5" stroke-linecap="round" />

  <!-- 3D Compass Needles -->
  <g filter="url(#needleShadow)">
    <polygon points="256,76 256,256 220,256" fill="url(#northLeft)" />
    <polygon points="256,76 292,256 256,256" fill="url(#northRight)" />
    
    <polygon points="256,436 256,256 220,256" fill="url(#southLeft)" />
    <polygon points="256,436 292,256 256,256" fill="url(#southRight)" />
  </g>

  <!-- Center Pivot Pin -->
  <circle cx="256" cy="256" r="32" fill="#18181b" stroke="#FF9500" stroke-width="7" />
  <circle cx="256" cy="256" r="14" fill="#FF9500" />
</svg>`;

// Write SVG icons
fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), svgContent, 'utf-8');
console.log('Saved public/icon.svg and src/app/icon.svg');

// 2. Build a valid 32x32 32bpp ICO file for legacy browser favicon.ico
function createIco32() {
  const size = 32;
  const numPixels = size * size;
  const imageSize = 40 + (numPixels * 4) + (numPixels / 8); // Header (40) + Pixel Data (BGRA) + AND mask
  const fileSize = 6 + 16 + imageSize;

  const buf = Buffer.alloc(fileSize);

  // ICONDIR
  buf.writeUInt16LE(0, 0); // Reserved
  buf.writeUInt16LE(1, 2); // Type: 1 = ICO
  buf.writeUInt16LE(1, 4); // 1 Image

  // ICONDIRENTRY
  buf.writeUInt8(size, 6); // Width
  buf.writeUInt8(size, 7); // Height
  buf.writeUInt8(0, 8);    // Color count (0 = >=8bpp)
  buf.writeUInt8(0, 9);    // Reserved
  buf.writeUInt16LE(1, 10); // Color planes
  buf.writeUInt16LE(32, 12); // Bits per pixel
  buf.writeUInt32LE(imageSize, 14); // Image size in bytes
  buf.writeUInt32LE(22, 18); // Image offset (6 + 16 = 22)

  // BITMAPINFOHEADER
  let offset = 22;
  buf.writeUInt32LE(40, offset); // Header size
  buf.writeInt32LE(size, offset + 4); // Width
  buf.writeInt32LE(size * 2, offset + 8); // Height x 2 (for XOR and AND mask)
  buf.writeUInt16LE(1, offset + 12); // Planes
  buf.writeUInt16LE(32, offset + 14); // Bit count
  buf.writeUInt32LE(0, offset + 16); // Compression (BI_RGB)
  buf.writeUInt32LE(imageSize - 40, offset + 20); // Image data size
  buf.writeInt32LE(0, offset + 24); // XPelsPerMeter
  buf.writeInt32LE(0, offset + 28); // YPelsPerMeter
  buf.writeUInt32LE(0, offset + 32); // ClrUsed
  buf.writeUInt32LE(0, offset + 36); // ClrImportant

  // Draw 32x32 pixels (Bottom-to-Top order in BMP)
  // Center is (15.5, 15.5)
  offset = 62;
  const center = (size - 1) / 2;
  const radius = 14;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center; // Notice bottom-up: y=0 is bottom, y=31 is top
      const dist = Math.sqrt(dx * dx + dy * dy);

      let b = 0, g = 0, r = 0, a = 0;

      if (dist <= radius) {
        // Inside dial
        b = 18; g = 18; r = 18; a = 255; // Dark bezel

        // Needle logic
        if (Math.abs(dx) <= 3 && dy >= 0) {
          // North needle (pointing up, which is positive y in bottom-up)
          b = 0; g = 149; r = 255; a = 255; // Orange (#FF9500)
        } else if (Math.abs(dx) <= 3 && dy < 0) {
          // South needle (pointing down)
          b = 255; g = 255; r = 255; a = 255; // White (#FFFFFF)
        }

        // Center pin
        if (dist <= 3) {
          b = 0; g = 149; r = 255; a = 255; // Orange center
        }
      }

      buf.writeUInt8(b, offset);
      buf.writeUInt8(g, offset + 1);
      buf.writeUInt8(r, offset + 2);
      buf.writeUInt8(a, offset + 3);
      offset += 4;
    }
  }

  // AND mask (all zeroes for 32bpp alpha transparency)
  // Remaining bytes in buffer are already 0

  return buf;
}

const icoBuffer = createIco32();
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuffer);
console.log('Saved public/favicon.ico and src/app/favicon.ico');
