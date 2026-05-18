import classNames from "classnames";
import { Pressable, Text } from "react-native";

type PillVariant = "primary" | "secondary";

interface PillProps {
  variant: PillVariant;
  label: string;
  onPress: () => void;
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

export const Pill = ({ variant, label, onPress, hitSlop }: PillProps) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      className={classNames("rounded-full px-4 py-2", VARIANT_CLASSES[variant])}
    >
      <Text
        className={classNames("text-sm font-medium", TEXT_CLASSES[variant])}
      >
        {label}
      </Text>
    </Pressable>
  );
};
