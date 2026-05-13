import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-600 active:bg-brand-700",
  secondary: "bg-gray-200 active:bg-gray-300",
  ghost: "bg-transparent active:bg-gray-100",
  destructive: "bg-red-600 active:bg-red-700",
};

const TEXT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "text-white",
  secondary: "text-gray-900",
  ghost: "text-gray-900",
  destructive: "text-white",
};

export function Button({
  onPress,
  children,
  variant = "primary",
  disabled,
  loading,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-xl px-4 py-3 items-center justify-center ${VARIANT_CLASSES[variant]} ${
        isDisabled ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "destructive" ? "white" : "black"} />
      ) : (
        <Text className={`font-semibold text-base ${TEXT_CLASSES[variant]}`}>{children}</Text>
      )}
    </Pressable>
  );
}
