export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand dark:bg-brand-dk active:bg-brand-hov dark:active:bg-brand-hov-dk",
  secondary:
    "bg-raised dark:bg-raised-dk active:bg-high dark:active:bg-high-dk",
  ghost:
    "bg-transparent active:bg-raised dark:active:bg-raised-dk",
  destructive:
    "bg-danger dark:bg-danger-dk active:bg-danger-hov dark:active:bg-danger-hov-dk",
};

export const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-danger-fg",
  secondary: "text-default dark:text-default-dk",
  ghost: "text-default dark:text-default-dk",
  destructive: "text-danger-fg",
};
