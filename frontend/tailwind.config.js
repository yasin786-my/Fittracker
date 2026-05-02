/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        energy: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'count-up': 'countUp 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'flame': 'flame 1.5s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        flame: {
          '0%, 100%': { transform: 'scaleY(1) rotate(-2deg)' },
          '50%': { transform: 'scaleY(1.1) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}
