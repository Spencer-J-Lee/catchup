import { Text, View } from "react-native";

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row gap-2 items-baseline">
      <Text className="text-sm text-fg-muted shrink-0">{label}:</Text>
      <Text className="text-base text-fg flex-1">{value}</Text>
    </View>
  );
}
