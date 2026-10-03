import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Bàn Số - Precision Digital Compass',
  description: 'La bàn định hướng kỹ thuật số chuẩn xác phong cách Apple Compass',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-black text-white antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
