import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './Gamification/src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'pale-blue': {
          50: '#f4f8ff',
          100: '#e7efff',
          150: '#dce8fb',
          200: '#cdddf7',
          300: '#b1caf0',
          400: '#8dafdf',
          500: '#698fc8',
        },
        navy: {
          950: '#14152f',
          900: '#20224a',
          850: '#292d5c',
          800: '#353b70',
          700: '#46518c',
          600: '#5869a5',
        },
        gold: {
          400: '#f8c05b',
          500: '#eea83a',
          600: '#c8791d',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#29265f',
        },
        accent: {
          50: '#e8faf7',
          100: '#c8f2eb',
          500: '#16a995',
          600: '#0e8175',
          700: '#11675f',
        },
        violet: {
          50: '#f3f0ff',
          100: '#e8e1ff',
          500: '#8066df',
          600: '#6d51ca',
          700: '#5941a8',
        },
        slate: {
          950: '#181a32',
        },
      },
      boxShadow: {
        soft: '0 12px 32px rgba(38, 44, 91, 0.08)',
        lift: '0 18px 42px rgba(38, 44, 91, 0.13)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        panel: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
