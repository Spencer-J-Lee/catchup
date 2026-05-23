import classNames from "classnames";
import { useEffect } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  className?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({
  className,
  width,
  height,
  circle,
  style,
}: SkeletonProps) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: circle ? 9999 : undefined },
        animatedStyle,
        style,
      ]}
      className={classNames(
        "bg-high dark:bg-high-dk",
        circle ? undefined : "rounded-md",
        className,
      )}
    />
  );
};
