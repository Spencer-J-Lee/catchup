import classNames from "classnames";
import { View, ViewProps } from "react-native";

export const INPUT_SURFACE_CLASS =
  "border border-border dark:border-border-dk rounded-xl px-3 py-3 bg-raised dark:bg-raised-dk text-default dark:text-default-dk";

interface InputSurfaceProps extends ViewProps {
  className?: string;
}

export const InputSurface = ({ className, ...props }: InputSurfaceProps) => {
  return (
    <View className={classNames(INPUT_SURFACE_CLASS, className)} {...props} />
  );
};
