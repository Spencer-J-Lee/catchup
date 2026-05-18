// Source of truth for the app color palette (Warm Coral + Cream).
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
  brand: "#d96e4a",
  brandHover: "#c25a3d",
  accent: "#e8b577",
  app: "#fdf8f3",
  raised: "#f5ede0",
  high: "#ebe0cf",
  fgDefault: "#2a2018",
  fgMuted: "#8a7a6e",
  fgSubtle: "#b5a89a",
  border: "#e5d8c5",
  danger: "#c8553d",
  dangerHover: "#b04733",
  dangerFg: "#ffffff",
  success: "#6b8e4e",
};

const darkColors = {
  brand: "#ee835f",
  brandHover: "#f59578",
  accent: "#e8b577",
  app: "#1f1a17",
  raised: "#2c2520",
  high: "#3a312a",
  fgDefault: "#f5ede4",
  fgMuted: "#a89888",
  fgSubtle: "#6e6258",
  border: "#3a312a",
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
