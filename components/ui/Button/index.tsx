import classNames from "classnames";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { colors } from "@/lib/colors";

import { ButtonVariant, TEXT_CLASSES, VARIANT_CLASSES } from "./styles";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button = ({
  onPress,
  children,
  variant = "primary",
  disabled,
  loading,
  className,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={classNames(
        "rounded-full px-4 py-3 items-center justify-center",
        VARIANT_CLASSES[variant],
        { "opacity-50": isDisabled },
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? colors.surface.DEFAULT : colors.fg.DEFAULT
          }
        />
      ) : (
        <Text
          className={classNames(
            "font-semibold text-base",
            TEXT_CLASSES[variant],
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};
