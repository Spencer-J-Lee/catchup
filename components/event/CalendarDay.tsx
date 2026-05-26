import classNames from "classnames";
import { Pressable, Text, View } from "react-native";
import type { DateData } from "react-native-calendars";

const DAY_BASE_CLASS =
  "w-10 h-10 items-center justify-center rounded-full border-2";

const DAY_SELECTED_CLASS =
  "bg-raised dark:bg-raised-dk border-raised dark:border-raised-dk active:bg-high dark:active:bg-high-dk active:border-high dark:active:border-high-dk";

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
  const isOutsideMonth = state === "disabled" || state === "inactive";
  const dots = marking?.dots ?? [];

  const variantClass = isSelected ? DAY_SELECTED_CLASS : "border-transparent";

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      accessibilityRole="button"
      className={classNames(DAY_BASE_CLASS, variantClass)}
    >
      {isDayToday ? (
        <Text className="absolute h-[150%] w-[150%] rounded border border-dashed border-border text-center text-[9px] font-bold tracking-wider text-brand dark:border-border-dk dark:text-brand-dk">
          TODAY
        </Text>
      ) : null}

      <Text
        className={classNames(
          "text-lg",
          isOutsideMonth
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
