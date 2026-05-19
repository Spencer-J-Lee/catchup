import classNames from "classnames";
import { useState } from "react";
import { View } from "react-native";

interface DashedDividerProps {
  className?: string;
}

const DASH_WIDTH = 8;
const DASH_GAP = 4;

export const DashedDivider = ({ className }: DashedDividerProps) => {
  const [dashCount, setDashCount] = useState(0);

  return (
    <View
      className={classNames("flex-row items-center", className)}
      style={{ gap: DASH_GAP }}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        const fittingCount = Math.max(
          0,
          Math.floor((width + DASH_GAP) / (DASH_WIDTH + DASH_GAP)),
        );
        setDashCount(fittingCount);
      }}
    >
      {Array.from({ length: dashCount }).map((_, dashIndex) => (
        <View
          key={dashIndex}
          className="h-0.5 bg-border dark:bg-border-dk"
          style={{ width: DASH_WIDTH }}
        />
      ))}
    </View>
  );
};
