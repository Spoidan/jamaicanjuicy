import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Jamaican juice palette
        juice: {
          50:  '#fff9eb',
          100: '#fef0c7',
          200: '#fedd89',
          300: '#fec84b',
          400: '#fdb022',
          500: '#f79009',
          600: '#dc6803',
          700: '#b54708',
          800: '#93370d',
          900: '#792e0d',
        },
        mango:   '#FF9B3D',
        lime:    '#84CC16',
        guava:   '#EC4899',
        tamarind:'#92400E',
        cane:    '#D97706',
        dark:    '#0D0D0D',
        cream:   '#FEFCE8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'slide-up':     'slideUp 0.5s ease-out',
        'fade-in':      'fadeIn 0.6s ease-out',
        'spin-slow':    'spin 20s linear infinite',
        'marquee':      'marquee 25s linear infinite',
        'marquee2':     'marquee2 25s linear infinite',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'tropical': 'linear-gradient(135deg, #FF9B3D 0%, #FFD700 50%, #FF6B6B 100%)',
      },
      boxShadow: {
        'juice': '0 4px 32px rgba(253, 176, 34, 0.4)',
        'juice-lg': '0 8px 48px rgba(253, 176, 34, 0.5)',
        'dark-card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
