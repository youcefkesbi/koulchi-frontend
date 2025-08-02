/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'algeria-green': '#006633',
        'algeria-red': '#CC0000',
        'algeria-white': '#FFFFFF',
        'primary': '#006633',
        'secondary': '#CC0000',
        'accent': '#FFD700',
        'dark': '#1a1a1a',
        'light-gray': '#f5f5f5'
      },
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
        'french': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
} 