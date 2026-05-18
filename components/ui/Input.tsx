import classNames from "classnames";
import { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

import { INPUT_SURFACE_CLASS } from "./InputSurface";
import { Label } from "./Label";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    const colors = useThemedColors();
    return (
      <View className="gap-2">
        {label ? <Label>{label}</Label> : null}

        <TextInput
          ref={ref}
          className={classNames(
            INPUT_SURFACE_CLASS,
            { "border-danger dark:border-danger-dk": !!error },
            className,
          )}
          placeholderTextColor={colors.fgSubtle}
          {...props}
        />

        {error ? (
          <Text className="text-xs text-danger dark:text-danger-dk">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);
Input.displayName = "Input";
