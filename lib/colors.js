// Source of truth for the app color palette (Lavender + Peach).
//
// Two exports:
//   1. `lightColors` / `darkColors` — role-keyed bags. Consumed by
//      hooks/use-themed-colors.ts for native props that don't take Tailwind
//      classes (Ionicons `color`, placeholderTextColor, navigation chrome).
//   2. `colors` — flat Tailwind token dict consumed by tailwind.config.js.
//      Tokens ending in `-dk` are the dark-mode variants, paired with their
//      base token via NativeWind `dark:` class variants
//      (e.g. `bg-app dark:bg-app-dk`).

const lightColors = {
  brand: "#9b87e5",
  brandHover: "#8470d4",
  accent: "#d97a3a",
  app: "#fdfdff",
  raised: "#f6f3fc",
  high: "#ebe5f5",
  fgDefault: "#1f1b2e",
  fgMuted: "#6e6885",
  fgSubtle: "#a8a3b8",
  border: "#e5dff0",
  danger: "#d96e4a",
  dangerHover: "#c25a3d",
  dangerFg: "#ffffff",
  success: "#6b8e4e",
};

const darkColors = {
  brand: "#a08ee2",
  brandHover: "#c9bcf5",
  accent: "#f5b988",
  app: "#1d1a26",
  raised: "#2d2a38",
  high: "#383541",
  fgDefault: "#f0ecf7",
  fgMuted: "#9692a4",
  fgSubtle: "#6c6878",
  border: "#383541",
  danger: "#ef7e63",
  dangerHover: "#d96849",
  dangerFg: "#ffffff",
  success: "#8fae6a",
};

const colors = {
  brand: lightColors.brand,
  "brand-dk": darkColors.brand,
  "brand-hov": lightColors.brandHover,
  "brand-hov-dk": darkColors.brandHover,
  accent: lightColors.accent,
  "accent-dk": darkColors.accent,
  app: lightColors.app,
  "app-dk": darkColors.app,
  raised: lightColors.raised,
  "raised-dk": darkColors.raised,
  high: lightColors.high,
  "high-dk": darkColors.high,
  default: lightColors.fgDefault,
  "default-dk": darkColors.fgDefault,
  muted: lightColors.fgMuted,
  "muted-dk": darkColors.fgMuted,
  subtle: lightColors.fgSubtle,
  "subtle-dk": darkColors.fgSubtle,
  border: lightColors.border,
  "border-dk": darkColors.border,
  danger: lightColors.danger,
  "danger-dk": darkColors.danger,
  "danger-hov": lightColors.dangerHover,
  "danger-hov-dk": darkColors.dangerHover,
  "danger-fg": lightColors.dangerFg,
  success: lightColors.success,
  "success-dk": darkColors.success,
};

module.exports = { colors, lightColors, darkColors };
