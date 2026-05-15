// Source of truth for the app color palette.
// Consumed by tailwind.config.js (via require) and by TS/JSX modules that
// need raw color strings for native props (e.g. placeholderTextColor,
// Ionicons color) that can't take Tailwind classes.

const colors = {
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
  // Error / destructive states.
  danger: {
    400: "#f87171",
    500: "#ef4444",
  },
};

module.exports = { colors };
