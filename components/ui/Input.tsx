import { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

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
      {label ? <Text className="text-sm font-medium text-fg-muted">{label}</Text> : null}
      <TextInput
        ref={ref}
        className={`border border-surface-border rounded-xl px-3 py-3 text-base bg-surface-elevated text-fg ${
          error ? "border-red-500" : ""
        } ${className ?? ""}`}
        placeholderTextColor="#6e6e73"
        {...props}
      />
      {error ? <Text className="text-xs text-red-400">{error}</Text> : null}
    </View>
  );
});
