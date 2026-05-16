import { View } from "react-native";

import { Label } from "./Label";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export const Field = ({ label, children }: FieldProps) => {
  return (
    <View className="gap-2">
      <Label>{label}</Label>
      {children}
    </View>
  );
};
