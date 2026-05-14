/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Coral accent — used for due/overdue, primary CTA pill, and active tab.
        brand: {
          50: "#fde8df",
          100: "#fbd1bf",
          200: "#f7b89f",
          300: "#f49b7c",
          400: "#f08a6a",
          500: "#ee835f",
          600: "#e07a5f",
          700: "#c95c3f",
        },
        // Dark surfaces. `surface` is the canvas, `surface-elevated` is rows
        // and pill buttons, `surface-high` is pressed state.
        surface: {
          DEFAULT: "#1a1a1a",
          elevated: "#2c2c2e",
          high: "#3a3a3c",
          border: "#2f2f31",
        },
        // Foreground (text) tokens.
        fg: {
          DEFAULT: "#ffffff",
          muted: "#8e8e93",
          subtle: "#6e6e73",
        },
      },
    },
  },
  plugins: [],
};
