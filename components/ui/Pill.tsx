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
  primary: "bg-brand-300 active:bg-brand-400",
  secondary: "bg-surface-elevated active:bg-surface-high",
};

const TEXT_CLASSES: Record<PillVariant, string> = {
  primary: "text-surface",
  secondary: "text-fg",
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
