import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemedColors } from "@/hooks/use-themed-colors";

interface DeveloperCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const DeveloperCard = ({
  title,
  description,
  children,
}: DeveloperCardProps) => {
  const colors = useThemedColors();
  const heading = "DEVELOPERS ONLY" + (title ? `· ${title}` : "");

  return (
    <View className="gap-3 p-4 rounded-2xl border-2 border-dashed border-accent dark:border-accent-dk bg-accent/5 dark:bg-accent-dk/10">
      <View className="flex-row items-center gap-2">
        <Ionicons name="construct" size={16} color={colors.accent} />
        <Text className="text-xs uppercase tracking-wide font-bold text-accent dark:text-accent-dk">
          {heading}
        </Text>
      </View>

      {description ? (
        <Text className="text-sm text-muted dark:text-muted-dk">
          {description}
        </Text>
      ) : null}

      {children ? <View className="gap-2">{children}</View> : null}
    </View>
  );
};
