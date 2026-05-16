import { View } from "react-native";

interface ChipRowProps {
  children: React.ReactNode;
}

export const ChipRow = ({ children }: ChipRowProps) => {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
};
