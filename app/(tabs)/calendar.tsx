import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { format, isToday, parseISO } from "date-fns";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarAgendaItem } from "@/components/event/CalendarAgendaItem";
import { CalendarDay } from "@/components/event/CalendarDay";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAllEvents } from "@/hooks/use-events";
import { useFormatters } from "@/hooks/use-formatters";
import { useFriends, type FriendWithStatus } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { darkColors, lightColors } from "@/lib/colors";
import { toast } from "@/lib/toast";
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

const CalendarScreen = () => {
  const colors = useThemedColors();
  const { colorScheme } = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();
  const isDark = colorScheme === "dark";

  const { data: events, isLoading, error: eventsError } = useAllEvents();
  const { data: friends, error: friendsError } = useFriends();
  const { formatLocalDateKey } = useFormatters();
  const todayKey = formatLocalDateKey(new Date());

  useEffect(() => {
    if (eventsError) {
      toast.error("Couldn't load events", {
        description: (eventsError as Error).message,
      });
    }
  }, [eventsError]);

  useEffect(() => {
    if (friendsError) {
      toast.error("Couldn't load friends", {
        description: (friendsError as Error).message,
      });
    }
  }, [friendsError]);

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatLocalDateKey(new Date()),
  );
  // Used to jump the user to today's date by re-rendering the calendar
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

    for (const events of map.values()) {
      events.sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
    }

    return map;
  }, [events, formatLocalDateKey]);

  const markedDates = useMemo(() => {
    const marksByDate: Record<string, DayMarking> = {};

    for (const [date, events] of eventsByDate) {
      const statuses = new Set<EventStatus>();
      for (const event of events) statuses.add(event.status);

      const dots = STATUS_DOT_ORDER.filter((status) =>
        statuses.has(status),
      ).map((status) => ({
        key: status,
        color: isDark
          ? STATUS_DOT_PALETTE[status].dark
          : STATUS_DOT_PALETTE[status].light,
      }));

      if (dots.length > 0) marksByDate[date] = { dots };
    }

    const marksForToday = marksByDate[selectedDate] ?? {};
    marksByDate[selectedDate] = { ...marksForToday, selected: true };
    return marksByDate;
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
      weekVerticalMargin: 8,
    }),
    [colors.app, colors.fgDefault, colors.fgMuted],
  );

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const isTodaySelected = isToday(parseISO(selectedDate));
  const formattedSelectedDate = format(
    parseISO(selectedDate),
    "EEEE, MMM d, yyyy",
  );
  const selectedLabel = isTodaySelected
    ? `Today · ${formattedSelectedDate}`
    : formattedSelectedDate;
  const listBottomPadding = tabBarHeight + 24;

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

      <View className="min-h-14 flex-row items-center justify-between px-4 py-3">
        <Text className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-muted-dk">
          {selectedLabel}
        </Text>

        {!isTodaySelected ? (
          <Button
            variant="secondary"
            size="xs"
            onPress={onJumpToToday}
            hitSlop={8}
          >
            Jump to today
          </Button>
        ) : null}
      </View>

      {isLoading && !events ? (
        <View
          className="flex-1 items-center justify-center"
          style={{ paddingBottom: listBottomPadding }}
        >
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      ) : selectedEvents.length === 0 ? (
        <View className="flex-1" style={{ paddingBottom: listBottomPadding }}>
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
            paddingBottom: listBottomPadding,
          }}
          scrollIndicatorInsets={{ bottom: tabBarHeight }}
        />
      )}
    </SafeAreaView>
  );
};

export default CalendarScreen;
