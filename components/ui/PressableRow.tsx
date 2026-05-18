import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

interface PressableRowProps {
  label: string;
  value: string;
  onPress: () => void;
}

export const PressableRow = ({ label, value, onPress }: PressableRowProps) => {
  const colors = useThemedColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-2 items-center -mx-2 px-2 py-1 rounded-lg active:bg-high dark:active:bg-high-dk"
      hitSlop={4}
    >
      <Text className="text-sm text-muted dark:text-muted-dk shrink-0">
        {label}:
      </Text>
      <Text className="text-base text-default dark:text-default-dk flex-1">
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.fgSubtle} />
    </Pressable>
  );
};
