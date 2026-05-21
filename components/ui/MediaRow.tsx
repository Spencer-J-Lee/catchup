import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

import { PressableSurface, Surface } from "./Surface";
import type { SurfaceSize } from "./Surface/styles";

interface MediaRowProps {
  leading: ReactNode;
  eyebrow?: string;
  label: string;
  subtitle?: string;
  surfaceSize?: SurfaceSize;
  disabled?: boolean;
  className?: string;
  onPress?: () => void;
}

export const MediaRow = ({
  leading,
  eyebrow,
  label,
  subtitle,
  surfaceSize,
  disabled,
  className,
  onPress,
}: MediaRowProps) => {
  const colors = useThemedColors();

  const content = (
    <>
      {leading}

      <View className="flex-1">
        {eyebrow ? (
          <Text className="text-xs uppercase tracking-wider text-subtle dark:text-subtle-dk">
            {eyebrow}
          </Text>
        ) : null}

        <Text
          className="text-base font-medium text-default dark:text-default-dk"
          numberOfLines={1}
        >
          {label}
        </Text>

        {subtitle ? (
          <Text className="text-sm text-muted dark:text-muted-dk">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.fgSubtle} />
      ) : null}
    </>
  );

  const containerClassName = classNames(
    "flex-row items-center gap-3",
    className,
  );

  if (onPress) {
    return (
      <PressableSurface
        onPress={onPress}
        disabled={disabled}
        size={surfaceSize}
        className={containerClassName}
      >
        {content}
      </PressableSurface>
    );
  }

  return (
    <Surface size={surfaceSize} className={containerClassName}>
      {content}
    </Surface>
  );
};
