/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // ← pour Expo Router
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F2E9DE",
        coffee: "#2E1900",
        charcoal: "#1F1F23",
        mocha: "#684C44",
        white: "#FFFFFF",
        black: "#000000",
      },
      fontFamily: {
        satoshi: ["Satoshi", "System", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
}
