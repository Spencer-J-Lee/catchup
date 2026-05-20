import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface SettingsSectionProps {
  label: string;
  children: ReactNode;
}

export const SettingsSection = ({ label, children }: SettingsSectionProps) => {
  return (
    <View className="gap-2">
      <Text className="text-xs uppercase tracking-wide font-semibold text-muted dark:text-muted-dk">
        {label}
      </Text>
      {children}
    </View>
  );
};
