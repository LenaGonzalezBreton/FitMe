/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0891b2', // A calming cyan
        accent: '#f97316', // A vibrant orange for highlights
        background: '#f8fafc', // A very light, clean gray
        surface: '#ffffff', // White for card backgrounds
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        border: '#e2e8f0',
      },
    },
  },
  plugins: [],
}

