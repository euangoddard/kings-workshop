/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'workshop-bg': '#0f172a',
        'panel-bg': '#1e293b',
        'panel-border': '#334155',
        'accent-gold': '#f59e0b',
        'accent-gold-light': '#fcd34d',
        'boss-red': '#dc2626',
        'scrap-gray': '#94a3b8',
      },
      fontFamily: {
        'medieval': ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
