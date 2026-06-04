import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { IconActionRow } from "@/components/ui/IconActionRow";
import { Screen } from "@/components/ui/Screen";
import { useThemedColors } from "@/hooks/use-themed-colors";

import {
  FADE_MS,
  STATUS_OPTIONS,
  type FollowUpOptionKey,
} from "./statusOptions";

interface StatusPickerProps {
  onSelect: (key: FollowUpOptionKey) => void;
}

export const StatusPicker = ({ onSelect }: StatusPickerProps) => {
  const colors = useThemedColors();

  return (
    <Screen edges={["bottom"]}>
      <Animated.View
        entering={FadeIn.duration(FADE_MS)}
        className="gap-4 pb-4 pt-6"
      >
        <View className="gap-2">
          {STATUS_OPTIONS.map((option) => (
            <IconActionRow
              key={option.key}
              label={option.label}
              icon={option.icon}
              iconColor={colors.dangerFg}
              iconBgClass={option.iconBgClass}
              onPress={() => onSelect(option.key)}
              iconSize={30}
            />
          ))}
        </View>
      </Animated.View>
    </Screen>
  );
};
