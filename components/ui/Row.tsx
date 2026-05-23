import { Text, View } from "react-native";

interface RowProps {
  label: string;
  value: string;
}

export const Row = ({ label, value }: RowProps) => {
  return (
    <View className="flex-row items-baseline gap-2">
      <Text className="shrink-0 text-sm text-muted dark:text-muted-dk">
        {label}:
      </Text>
      <Text className="flex-1 text-base text-default dark:text-default-dk">
        {value}
      </Text>
    </View>
  );
};
