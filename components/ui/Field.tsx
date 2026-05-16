import classNames from "classnames";
import { View } from "react-native";

import { Label } from "./Label";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({ label, children, className }: FieldProps) => {
  return (
    <View className={classNames("gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </View>
  );
};
