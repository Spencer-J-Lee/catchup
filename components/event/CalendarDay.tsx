import classNames from "classnames";
import { Pressable, Text, View } from "react-native";
import type { DateData } from "react-native-calendars";

const DAY_BASE_CLASS =
  "w-10 h-10 items-center justify-center rounded-full border-2";

const DAY_SELECTED_CLASS =
  "bg-raised dark:bg-raised-dk border-raised dark:border-raised-dk active:bg-high dark:active:bg-high-dk active:border-high dark:active:border-high-dk";

const DAY_TODAY_CLASS = "border-dotted border-high dark:border-high-dk";

interface CalendarDayProps {
  date?: DateData;
  state?: "selected" | "disabled" | "inactive" | "today" | "";
  marking?: {
    selected?: boolean;
    dots?: { key?: string; color: string }[];
  };
  onPress?: (date?: DateData) => void;
}

export const CalendarDay = ({
  date,
  state,
  marking,
  onPress,
}: CalendarDayProps) => {
  const isSelected = marking?.selected === true;
  const isDayToday = state === "today";
  const isDisabled = state === "disabled" || state === "inactive";
  const dots = marking?.dots ?? [];

  const variantClass = isSelected
    ? DAY_SELECTED_CLASS
    : isDayToday
      ? DAY_TODAY_CLASS
      : "border-transparent";

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      disabled={isDisabled}
      accessibilityRole="button"
      className={classNames(DAY_BASE_CLASS, variantClass)}
    >
      {isDayToday ? (
        // Explicit width avoids strange text wrapping where it shouldn't
        <Text className="absolute w-[35px] -top-4 text-[9px] font-bold tracking-wider text-brand dark:text-brand-dk">
          TODAY
        </Text>
      ) : null}

      <Text
        className={classNames(
          "text-lg",
          isDisabled
            ? "text-subtle dark:text-subtle-dk"
            : "text-default dark:text-default-dk",
        )}
      >
        {date?.day}
      </Text>

      {dots.length > 0 ? (
        <View className="absolute bottom-[3px] flex-row gap-0.5">
          {dots.map((dot, index) => (
            <View
              key={dot.key ?? `${dot.color}-${index}`}
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: dot.color,
              }}
            />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
};
