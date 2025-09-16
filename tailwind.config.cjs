/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1e40af'
        }
      }
    },
  },
  plugins: [],
}

