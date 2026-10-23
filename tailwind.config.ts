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
          50: '#f8fbff',
          100: '#f0f6fc',
          150: '#e8f2fa',
          200: '#e0eef9',
          300: '#cee4f7',
          400: '#a9cef0',
          500: '#6ca6e2',
        },
        navy: {
          950: '#061120',
          900: '#0e2038',
          850: '#122846',
          800: '#173256',
          700: '#204474',
          600: '#295792',
        },
        gold: {
          400: '#ffbe2e',
          500: '#f5a623',
          600: '#d98200',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#172554',
        },
        accent: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        slate: {
          950: '#020817',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
