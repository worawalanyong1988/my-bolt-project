/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBF9F5',
          100: '#F5F0E6',
          200: '#EBE3D2',
        },
        charcoal: {
          DEFAULT: '#2B2B2B',
          light: '#4A4A4A',
          muted: '#8A8A8A',
        },
        terracotta: {
          50: '#FDF4F1',
          100: '#FBE3DC',
          200: '#F4C7B9',
          300: '#ECA98F',
          400: '#E59070',
          500: '#E07A5F',
          600: '#C9634A',
          700: '#A84C37',
          800: '#873D2E',
          900: '#6B3326',
        },
      },
      fontFamily: {
        plex: ['"IBM Plex Sans Thai"', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
