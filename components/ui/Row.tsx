import { Text, View } from "react-native";

interface RowProps {
  label: string;
  value: string;
}

export const Row = ({ label, value }: RowProps) => {
  return (
    <View className="flex-row gap-2 items-baseline">
      <Text className="text-sm text-fg-muted shrink-0">{label}:</Text>
      <Text className="text-base text-fg flex-1">{value}</Text>
    </View>
  );
};
