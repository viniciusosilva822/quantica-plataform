import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c0a17',
        nebula: '#1a1530',
        violet: '#7c3aed',
        gold: '#facc15',
        rose: '#f472b6',
      },
      fontFamily: {
        display: ['ui-serif', 'Georgia', 'serif'],
      },
      backgroundImage: {
        cosmos:
          'radial-gradient(ellipse at top, #2a1f4d 0%, #15102e 35%, #0a0716 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
