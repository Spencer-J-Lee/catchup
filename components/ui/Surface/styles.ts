export type SurfaceSize = "md" | "sm";

export const SURFACE_CLASS = "bg-raised dark:bg-raised-dk";
export const SURFACE_PRESSABLE_CLASS =
  "bg-raised dark:bg-raised-dk active:bg-high dark:active:bg-high-dk";

export const SIZE_CLASSES: Record<SurfaceSize, string> = {
  md: "rounded-2xl p-4",
  sm: "rounded-xl p-3",
};
