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
  primary: "bg-brand-300 active:bg-brand-400",
  secondary: "bg-surface-elevated active:bg-surface-high",
  ghost: "bg-transparent active:bg-surface-elevated",
  destructive: "bg-red-600 active:bg-red-700",
};

const TEXT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "text-surface",
  secondary: "text-fg",
  ghost: "text-fg",
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
      className={`rounded-full px-4 py-3 items-center justify-center ${VARIANT_CLASSES[variant]} ${
        isDisabled ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary"
              ? "#1a1a1a"
              : variant === "destructive"
                ? "white"
                : "white"
          }
        />
      ) : (
        <Text className={`font-semibold text-base ${TEXT_CLASSES[variant]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
