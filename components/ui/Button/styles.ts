import type { lightColors } from "@/lib/colors";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "xs" | "md" | "lg";

type ThemedColors = typeof lightColors;

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand dark:bg-brand-dk active:bg-brand-hov dark:active:bg-brand-hov-dk",
  secondary:
    "bg-raised dark:bg-raised-dk active:bg-high dark:active:bg-high-dk",
  ghost: "bg-transparent active:bg-raised dark:active:bg-raised-dk",
  destructive:
    "bg-danger dark:bg-danger-dk active:bg-danger-hov dark:active:bg-danger-hov-dk",
};

export const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-brand-fg dark:text-brand-fg-dk",
  secondary: "text-default dark:text-default-dk",
  ghost: "text-default dark:text-default-dk",
  destructive: "text-danger-fg",
};

export const SIZE_CONTAINER_CLASSES: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 rounded-lg",
  md: "px-4 py-2 rounded-lg",
  lg: "px-4 py-3 rounded-xl",
};

export const SIZE_TEXT_CLASSES: Record<ButtonSize, string> = {
  xs: "text-xs font-semibold",
  md: "text-sm font-semibold",
  lg: "text-base font-semibold",
};

export const getIndicatorColors = (
  colors: ThemedColors,
): Record<ButtonVariant, string> => ({
  primary: colors.brandFg,
  secondary: colors.fgDefault,
  ghost: colors.fgDefault,
  destructive: colors.dangerFg,
});
