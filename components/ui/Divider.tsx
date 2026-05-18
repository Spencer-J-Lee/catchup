import classNames from "classnames";
import { View } from "react-native";

interface DividerProps {
  className?: string;
}

export const Divider = ({ className }: DividerProps) => {
  return (
    <View className={classNames("h-px bg-border dark:bg-border-dk", className)} />
  );
};
