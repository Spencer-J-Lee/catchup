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
      {label ? <Text className="text-sm font-medium text-gray-700">{label}</Text> : null}
      <TextInput
        ref={ref}
        className={`border border-gray-300 rounded-xl px-3 py-3 text-base bg-white ${
          error ? "border-red-500" : ""
        } ${className ?? ""}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
});
