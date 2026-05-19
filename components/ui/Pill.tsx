import classNames from "classnames";
import { Pressable, Text } from "react-native";

type PillVariant = "primary" | "secondary";
type PillSize = "xs" | "md";

interface PillProps {
  variant: PillVariant;
  label: string;
  onPress: () => void;
  size?: PillSize;
  hitSlop?: number;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  primary:
    "bg-brand dark:bg-brand-dk active:bg-brand-hov dark:active:bg-brand-hov-dk",
  secondary:
    "bg-raised dark:bg-raised-dk active:bg-high dark:active:bg-high-dk",
};

const TEXT_CLASSES: Record<PillVariant, string> = {
  primary: "text-danger-fg",
  secondary: "text-default dark:text-default-dk",
};

const SIZE_CONTAINER_CLASSES: Record<PillSize, string> = {
  xs: "px-3 py-1.5",
  md: "px-4 py-2",
};

const SIZE_TEXT_CLASSES: Record<PillSize, string> = {
  xs: "text-xs font-semibold",
  md: "text-xs font-medium",
};

export const Pill = ({
  variant,
  label,
  onPress,
  size = "md",
  hitSlop,
}: PillProps) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      className={classNames(
        "rounded-full",
        SIZE_CONTAINER_CLASSES[size],
        VARIANT_CLASSES[variant],
      )}
    >
      <Text
        className={classNames(SIZE_TEXT_CLASSES[size], TEXT_CLASSES[variant])}
      >
        {label}
      </Text>
    </Pressable>
  );
};
