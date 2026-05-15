export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-300 active:bg-brand-400",
  secondary: "bg-surface-elevated active:bg-surface-high",
  ghost: "bg-transparent active:bg-surface-elevated",
  destructive: "bg-red-600 active:bg-red-700",
};

export const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-surface",
  secondary: "text-fg",
  ghost: "text-fg",
  destructive: "text-white",
};
