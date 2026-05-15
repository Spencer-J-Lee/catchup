import classNames from "classnames";
import { Pressable, Text } from "react-native";

interface ChipProps {
  selected: boolean;
  label: string;
  onPress: () => void;
}

export function Chip({ selected, label, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={classNames(
        "px-3 py-2 rounded-full",
        selected ? "bg-brand-300" : "bg-surface-elevated",
      )}
    >
      <Text className={selected ? "text-surface font-medium" : "text-fg"}>
        {label}
      </Text>
    </Pressable>
  );
}
