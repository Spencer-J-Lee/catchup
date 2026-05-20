// TODO: REVIEW

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import classNames from "classnames";
import { format, isToday, parseISO } from "date-fns";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarAgendaItem } from "@/components/event/CalendarAgendaItem";
import { EventListSkeleton } from "@/components/event/EventRowSkeleton";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAllEvents } from "@/hooks/use-events";
import { useFormatters } from "@/hooks/use-formatters";
import { useFriends, type FriendWithStatus } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { darkColors, lightColors } from "@/lib/colors";
import type { CatchUpEvent, EventStatus } from "@/types/database";

type DotStatus = Exclude<EventStatus, "cancelled">;

type DayMarking = {
  dots?: { key: string; color: string }[];
  selected?: boolean;
};

const STATUS_DOT_PALETTE: Record<DotStatus, { light: string; dark: string }> = {
  scheduled: { light: lightColors.brand, dark: darkColors.brand },
  completed: { light: lightColors.success, dark: darkColors.success },
  missed: { light: lightColors.danger, dark: darkColors.danger },
};

const STATUS_DOT_ORDER: DotStatus[] = ["scheduled", "missed", "completed"];

const eventTimestamp = (event: CatchUpEvent): number =>
  new Date(event.event_at).getTime();

interface CalendarDayProps {
  date?: DateData;
  state?: "selected" | "disabled" | "inactive" | "today" | "";
  marking?: {
    selected?: boolean;
    dots?: { key?: string; color: string }[];
  };
  onPress?: (date?: DateData) => void;
}

const CalendarDay = ({ date, state, marking, onPress }: CalendarDayProps) => {
  const isSelected = marking?.selected === true;
  const isDayToday = state === "today";
  const isDisabled = state === "disabled" || state === "inactive";
  const dots = marking?.dots ?? [];

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      disabled={isDisabled}
      accessibilityRole="button"
      className={classNames(
        "w-10 h-10 items-center justify-center rounded-full border-2",
        isSelected
          ? "bg-raised dark:bg-raised-dk border-raised dark:border-raised-dk active:bg-high dark:active:bg-high-dk active:border-high dark:active:border-high-dk"
          : isDayToday
            ? "border-dotted border-high dark:border-high-dk"
            : "border-transparent",
      )}
    >
      {isDayToday ? (
        // Need explicit width here due to strange behavior with text wrapping when it shouldn't
        <Text className="absolute w-[36px] -top-1.5 text-[9px] font-bold tracking-wider text-brand dark:text-brand-dk">
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

const CalendarScreen = () => {
  const colors = useThemedColors();
  const { colorScheme } = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const isDark = colorScheme === "dark";

  const { data: events, isLoading } = useAllEvents();
  const { data: friends } = useFriends();
  const { formatLocalDateKey } = useFormatters();
  const todayKey = formatLocalDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatLocalDateKey(new Date()),
  );
  const [jumpToken, setJumpToken] = useState(0);

  const friendById = useMemo(() => {
    const map = new Map<string, FriendWithStatus>();
    for (const friend of friends ?? []) map.set(friend.id, friend);
    return map;
  }, [friends]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CatchUpEvent[]>();
    for (const event of events ?? []) {
      const key = formatLocalDateKey(event.event_at);
      const list = map.get(key);
      if (list) list.push(event);
      else map.set(key, [event]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
    }
    return map;
  }, [events, formatLocalDateKey]);

  const markedDates = useMemo(() => {
    const marks: Record<string, DayMarking> = {};
    for (const [date, list] of eventsByDate) {
      const present = new Set<DotStatus>();
      for (const event of list) {
        if (event.status === "cancelled") continue;
        present.add(event.status);
      }
      const dots = STATUS_DOT_ORDER.filter((status) => present.has(status)).map(
        (status) => ({
          key: status,
          color: isDark
            ? STATUS_DOT_PALETTE[status].dark
            : STATUS_DOT_PALETTE[status].light,
        }),
      );
      if (dots.length > 0) marks[date] = { dots };
    }
    const existing = marks[selectedDate] ?? {};
    marks[selectedDate] = { ...existing, selected: true };
    return marks;
  }, [eventsByDate, selectedDate, isDark]);

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: colors.app,
      monthTextColor: colors.fgDefault,
      arrowColor: colors.fgDefault,
      textSectionTitleColor: colors.fgMuted,
      textMonthFontWeight: 600 as const,
      textMonthFontSize: 18,
      textDayHeaderFontWeight: 600 as const,
      weekVerticalMargin: 6,
    }),
    [colors.app, colors.fgDefault, colors.fgMuted],
  );

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const isSelectedToday = isToday(parseISO(selectedDate));
  const selectedLabel = (() => {
    const parsed = parseISO(selectedDate);
    return isSelectedToday
      ? `Today · ${format(parsed, "EEEE, MMM d")}`
      : format(parsed, "EEEE, MMM d, yyyy");
  })();

  const onDayPress = (date: DateData) => setSelectedDate(date.dateString);
  const onJumpToToday = () => {
    setSelectedDate(todayKey);
    setJumpToken((token) => token + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-app dark:bg-app-dk" edges={["top"]}>
      <Calendar
        key={`cal-${colorScheme}-${jumpToken}`}
        current={selectedDate}
        markedDates={markedDates}
        markingType="multi-dot"
        onDayPress={onDayPress}
        theme={calendarTheme}
        dayComponent={CalendarDay}
        enableSwipeMonths
        firstDay={0}
        hideExtraDays={false}
      />

      <Divider className="mt-2" />

      <View className="flex-row items-center justify-between px-4 py-3 min-h-14">
        <Text className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-muted-dk">
          {selectedLabel}
        </Text>

        {!isSelectedToday ? (
          <Button variant="secondary" size="xs" onPress={onJumpToToday}>
            Jump to today
          </Button>
        ) : null}
      </View>

      {isLoading && !events ? (
        <EventListSkeleton paddingBottom={tabBarHeight + 24} />
      ) : selectedEvents.length === 0 ? (
        <View className="flex-1" style={{ paddingBottom: tabBarHeight + 24 }}>
          <EmptyState
            icon="calendar-outline"
            title="No catch-ups on this day"
          />
        </View>
      ) : (
        <FlatList
          data={selectedEvents}
          keyExtractor={(event) => event.id}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
          renderItem={({ item }) => (
            <CalendarAgendaItem
              event={item}
              friend={friendById.get(item.friend_id)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: tabBarHeight + 24,
          }}
          scrollIndicatorInsets={{ bottom: tabBarHeight }}
        />
      )}
    </SafeAreaView>
  );
};

export default CalendarScreen;
