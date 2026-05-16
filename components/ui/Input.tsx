import classNames from "classnames";
import { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/lib/colors";

import { INPUT_SURFACE_CLASS } from "./InputSurface";
import { Label } from "./Label";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <View className="gap-2">
        {label ? <Label>{label}</Label> : null}

        <TextInput
          ref={ref}
          className={classNames(
            INPUT_SURFACE_CLASS,
            { "border-danger-500": !!error },
            className,
          )}
          placeholderTextColor={colors.fg.subtle}
          {...props}
        />

        {error ? (
          <Text className="text-xs text-danger-400">{error}</Text>
        ) : null}
      </View>
    );
  },
);
Input.displayName = "Input";
