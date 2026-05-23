import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

import { PressableSurface } from "@/components/ui/Surface";
import { useThemedColors } from "@/hooks/use-themed-colors";

interface ContactActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ContactActionButton = ({
  icon,
  label,
  onPress,
  disabled,
}: ContactActionButtonProps) => {
  const colors = useThemedColors();
  return (
    <PressableSurface
      onPress={onPress}
      disabled={disabled}
      size="sm"
      className="flex-1 items-center justify-center gap-1"
    >
      <Ionicons name={icon} size={22} color={colors.brand} />
      <Text className="text-xs font-medium text-default dark:text-default-dk">
        {label}
      </Text>
    </PressableSurface>
  );
};
