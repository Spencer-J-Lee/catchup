import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { Text, View } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

import { PressableSurface } from "./Surface";
import type { SurfaceSize } from "./Surface/styles";

interface IconActionRowProps {
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconSize?: number;
  iconBgClass?: string;
  surfaceSize?: SurfaceSize;
  disabled?: boolean;
  className?: string;
  onPress: () => void;
}

export const IconActionRow = ({
  icon,
  iconColor,
  label,
  onPress,
  subtitle,
  iconSize = 22,
  iconBgClass,
  surfaceSize,
  disabled,
  className,
}: IconActionRowProps) => {
  const colors = useThemedColors();

  const iconNode = <Ionicons name={icon} size={iconSize} color={iconColor} />;

  return (
    <PressableSurface
      onPress={onPress}
      disabled={disabled}
      size={surfaceSize}
      className={classNames("flex-row items-center gap-3", className)}
    >
      {iconBgClass ? (
        <View
          className={classNames(
            "h-12 w-12 rounded-full items-center justify-center",
            iconBgClass,
          )}
        >
          {iconNode}
        </View>
      ) : (
        iconNode
      )}

      <View className="flex-1">
        <Text className="text-base font-medium text-default dark:text-default-dk">
          {label}
        </Text>

        {subtitle ? (
          <Text className="text-xs text-muted dark:text-muted-dk mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.fgSubtle} />
    </PressableSurface>
  );
};
