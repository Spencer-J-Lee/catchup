import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { colors } from "@/lib/colors";

interface PressableRowProps {
  label: string;
  value: string;
  onPress: () => void;
}

export const PressableRow = ({ label, value, onPress }: PressableRowProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-2 items-center -mx-2 px-2 py-1 rounded-lg active:bg-surface-high"
      hitSlop={4}
    >
      <Text className="text-sm text-fg-muted shrink-0">{label}:</Text>
      <Text className="text-base text-fg flex-1">{value}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.fg.subtle} />
    </Pressable>
  );
};
