import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        compass: {
          dark: '#000000',
          dial: '#0c0c0e',
          card: '#18181b',
          orange: '#FF9500',
          red: '#FF3B30',
          green: '#34C759',
          muted: '#8E8E93',
        },
      },
    },
  },
  plugins: [],
};
export default config;
