// TODO: Review
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
  brand: "#8568ec",
  brandHover: "#7050d8",
  brandFg: "#ffffff",
  accent: "#f06a1f",
  app: "#fdfdff",
  raised: "#f3f0f8",
  high: "#e2d6f7",
  fgDefault: "#1f1b2e",
  fgMuted: "#6e6885",
  fgSubtle: "#a8a3b8",
  border: "#dccff0",
  danger: "#de6b48",
  dangerHover: "#c45a3d",
  dangerFg: "#ffffff",
  success: "#6a9646",
};

const darkColors = {
  brand: "#9678ed",
  brandHover: "#b29df7",
  brandFg: "#f1ebff",
  accent: "#ffb168",
  app: "#1d1a26",
  raised: "#2d2a38",
  high: "#383541",
  fgDefault: "#f0ecf7",
  fgMuted: "#9692a4",
  fgSubtle: "#6c6878",
  border: "#4a4757",
  danger: "#f17b62",
  dangerHover: "#db6347",
  dangerFg: "#ffffff",
  success: "#91b268",
};

const colors = {
  brand: lightColors.brand,
  "brand-dk": darkColors.brand,
  "brand-hov": lightColors.brandHover,
  "brand-hov-dk": darkColors.brandHover,
  "brand-fg": lightColors.brandFg,
  "brand-fg-dk": darkColors.brandFg,
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
