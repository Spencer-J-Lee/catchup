import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

type TextStyle = "default" | "link";

const VALUE_TEXT_VARIANT_CLASSES: Record<TextStyle, string> = {
  default: "text-default dark:text-default-dk",
  link: "text-brand dark:text-brand-dk underline",
};

interface PressableRowProps {
  label: string;
  value: string;
  onPress: () => void;
  textStyle?: TextStyle;
}

export const PressableRow = ({
  label,
  value,
  onPress,
  textStyle = "default",
}: PressableRowProps) => {
  const colors = useThemedColors();

  return (
    <Pressable
      onPress={onPress}
      className="-mx-2 flex-row items-center gap-2 rounded-lg px-2 py-1 active:bg-high dark:active:bg-high-dk"
      hitSlop={4}
    >
      <Text className="shrink-0 text-sm text-muted dark:text-muted-dk">
        {label}:
      </Text>
      <Text
        className={`flex-1 text-base ${VALUE_TEXT_VARIANT_CLASSES[textStyle]}`}
      >
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.fgSubtle} />
    </Pressable>
  );
};
