import classNames from "classnames";
import { Pressable, PressableProps } from "react-native";

import {
  SIZE_CLASSES,
  SURFACE_CLASS,
  SURFACE_PRESSABLE_CLASS,
  SurfaceSize,
} from "./styles";

interface PressableSurfaceProps extends PressableProps {
  size?: SurfaceSize;
  className?: string;
}

export const PressableSurface = ({
  size = "md",
  className,
  disabled,
  ...props
}: PressableSurfaceProps) => {
  return (
    <Pressable
      disabled={disabled}
      className={classNames(
        disabled ? `${SURFACE_CLASS} opacity-40` : SURFACE_PRESSABLE_CLASS,
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
};
