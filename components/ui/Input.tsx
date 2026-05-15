import classNames from "classnames";
import { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/lib/colors";

import { Label } from "./Label";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, ...props },
  ref,
) {
  return (
    <View className="gap-1">
      {label ? <Label>{label}</Label> : null}

      <TextInput
        ref={ref}
        className={classNames(
          "border border-surface-border rounded-xl px-3 py-3 text-base bg-surface-elevated text-fg",
          { "border-red-500": !!error },
          className,
        )}
        placeholderTextColor={colors.fg.subtle}
        {...props}
      />

      {error ? <Text className="text-xs text-red-400">{error}</Text> : null}
    </View>
  );
});
