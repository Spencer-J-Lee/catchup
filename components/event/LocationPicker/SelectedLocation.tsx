import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

interface SelectedLocationProps {
  name: string;
  address: string;
  onClear: () => void;
}

export const SelectedLocation = ({
  name,
  address,
  onClear,
}: SelectedLocationProps) => {
  const colors = useThemedColors();

  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1">
        {name ? (
          <Text className="text-base text-default dark:text-default-dk">
            {name}
          </Text>
        ) : null}

        {address ? (
          <Text
            className="text-sm text-muted dark:text-muted-dk"
            numberOfLines={2}
          >
            {address}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={onClear}
        hitSlop={8}
        className="-mr-1 p-1"
        accessibilityLabel="Clear location"
      >
        <Ionicons name="close-circle" size={20} color={colors.fgSubtle} />
      </Pressable>
    </View>
  );
};
