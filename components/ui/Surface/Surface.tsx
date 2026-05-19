import classNames from "classnames";
import { View, ViewProps } from "react-native";

import { SIZE_CLASSES, SURFACE_CLASS, SurfaceSize } from "./styles";

interface SurfaceProps extends ViewProps {
  size?: SurfaceSize;
  className?: string;
}

export const Surface = ({
  size = "md",
  className,
  ...props
}: SurfaceProps) => {
  return (
    <View
      className={classNames(SURFACE_CLASS, SIZE_CLASSES[size], className)}
      {...props}
    />
  );
};
