import classNames from "classnames";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

import {
  ButtonSize,
  ButtonVariant,
  SIZE_CONTAINER_CLASSES,
  SIZE_TEXT_CLASSES,
  TEXT_CLASSES,
  VARIANT_CLASSES,
} from "./styles";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  hitSlop?: number;
  className?: string;
}

export const Button = ({
  onPress,
  children,
  variant = "primary",
  size = "lg",
  disabled,
  loading,
  hitSlop,
  className,
}: ButtonProps) => {
  const colors = useThemedColors();
  const isDisabled = disabled || loading;
  const indicatorColor =
    variant === "primary" || variant === "destructive"
      ? colors.dangerFg
      : colors.fgDefault;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={hitSlop}
      className={classNames(
        "items-center justify-center",
        SIZE_CONTAINER_CLASSES[size],
        VARIANT_CLASSES[variant],
        { "opacity-50": isDisabled },
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text
          className={classNames(SIZE_TEXT_CLASSES[size], TEXT_CLASSES[variant])}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};
