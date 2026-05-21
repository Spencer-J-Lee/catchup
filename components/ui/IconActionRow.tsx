import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { View } from "react-native";

import { MediaRow } from "./MediaRow";
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
  const iconNode = <Ionicons name={icon} size={iconSize} color={iconColor} />;

  const leading = iconBgClass ? (
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
  );

  return (
    <MediaRow
      leading={leading}
      label={label}
      subtitle={subtitle}
      surfaceSize={surfaceSize}
      disabled={disabled}
      className={className}
      onPress={onPress}
    />
  );
};
