// TODO: Review

import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  FriendListItem,
  type FriendItemAction,
} from "@/components/friend/FriendListItem";
import { DashedDivider } from "@/components/ui/DashedDivider";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useMissedEvents, useScheduledEvents } from "@/hooks/use-events";
import { useFriends, type FriendWithStatus } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import {
  deriveFriendState,
  formatLifecycleState,
  type FriendLifecycleState,
} from "@/lib/lifecycle";
import { ROUTES } from "@/lib/routes";

const SECTION_ICONS: Record<
  FriendLifecycleState,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  awaiting_followup: "sparkles-outline",
  scheduled: "calendar-outline",
  due: "time-outline",
  caught_up: "checkmark-circle-outline",
};

type FriendRow = {
  friend: FriendWithStatus;
  action: FriendItemAction | null;
  whenAt: string | null;
  scheduledEventId: string | null;
  missedAt: string | null;
  isDue: boolean;
};

type Section =
  | {
      kind: "header";
      title: string;
      count: number;
      state: FriendLifecycleState;
    }
  | { kind: "friend"; row: FriendRow };

const FriendsScreen = () => {
  const colors = useThemedColors();
  const tabBarHeight = useBottomTabBarHeight();
  const { data, isLoading, error, refetch, isRefetching } = useFriends();
  const { data: scheduledEvents } = useScheduledEvents();
  const { data: missedEvents } = useMissedEvents();
  const [search, setSearch] = useState("");

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    const now = new Date();
    const nowMs = now.getTime();

    type EventRef = { id: string; event_at: string };
    const pastByFriend = new Map<string, EventRef>();
    const upcomingByFriend = new Map<string, EventRef>();
    for (const event of scheduledEvents ?? []) {
      const scheduledMs = new Date(event.event_at).getTime();
      const isPast = scheduledMs < nowMs;
      const bucket = isPast ? pastByFriend : upcomingByFriend;
      const existing = bucket.get(event.friend_id);
      // Past: keep the oldest (longest awaiting). Upcoming: keep the soonest.
      const replace =
        !existing || scheduledMs < new Date(existing.event_at).getTime();
      if (replace) {
        bucket.set(event.friend_id, {
          id: event.id,
          event_at: event.event_at,
        });
      }
    }

    const recentMissedByFriend = new Map<string, EventRef>();
    for (const event of missedEvents ?? []) {
      const existing = recentMissedByFriend.get(event.friend_id);
      if (
        !existing ||
        new Date(event.event_at).getTime() >
          new Date(existing.event_at).getTime()
      ) {
        recentMissedByFriend.set(event.friend_id, {
          id: event.id,
          event_at: event.event_at,
        });
      }
    }

    const query = search.trim().toLowerCase();
    const filtered = query
      ? data.filter((friend) =>
          `${friend.first_name} ${friend.last_name ?? ""}`
            .toLowerCase()
            .includes(query),
        )
      : data;

    const awaitingFollowup: FriendRow[] = [];
    const scheduled: FriendRow[] = [];
    const due: FriendRow[] = [];
    const caughtUp: FriendRow[] = [];

    for (const friend of filtered) {
      const past = pastByFriend.get(friend.id) ?? null;
      const upcoming = upcomingByFriend.get(friend.id) ?? null;
      const missed = recentMissedByFriend.get(friend.id) ?? null;

      const { state } = deriveFriendState({
        nextDueAt: friend.next_due_at,
        lastCaughtUpAt: friend.last_caught_up_at,
        upcomingScheduled: upcoming,
        pastScheduled: past,
        recentMissed: missed,
        now,
      });

      if (state === "awaiting_followup" && past) {
        awaitingFollowup.push({
          friend,
          action: "followUp",
          whenAt: past.event_at,
          scheduledEventId: past.id,
          missedAt: null,
          isDue: true,
        });
      } else if (state === "scheduled" && upcoming) {
        scheduled.push({
          friend,
          action: "edit",
          whenAt: upcoming.event_at,
          scheduledEventId: upcoming.id,
          missedAt: null,
          isDue: false,
        });
      } else if (state === "due") {
        // Surface a "missed N days ago" hint when the auto-flow kicked in.
        const missedAt = missed
          ? !friend.last_caught_up_at ||
            new Date(missed.event_at).getTime() >
              new Date(friend.last_caught_up_at).getTime()
            ? missed.event_at
            : null
          : null;
        due.push({
          friend,
          action: "schedule",
          whenAt: null,
          scheduledEventId: null,
          missedAt,
          isDue: true,
        });
      } else {
        caughtUp.push({
          friend,
          action: null,
          whenAt: null,
          scheduledEventId: null,
          missedAt: null,
          isDue: false,
        });
      }
    }

    awaitingFollowup.sort(
      (left, right) =>
        new Date(left.whenAt!).getTime() - new Date(right.whenAt!).getTime(),
    );
    scheduled.sort(
      (left, right) =>
        new Date(left.whenAt!).getTime() - new Date(right.whenAt!).getTime(),
    );
    due.sort((left, right) => {
      // Missed friends first; within each group, sort by the relevant timestamp.
      if (!!left.missedAt !== !!right.missedAt) {
        return left.missedAt ? -1 : 1;
      }
      const leftKey =
        (left.missedAt && new Date(left.missedAt).getTime()) ||
        (left.friend.next_due_at &&
          new Date(left.friend.next_due_at).getTime()) ||
        Infinity;
      const rightKey =
        (right.missedAt && new Date(right.missedAt).getTime()) ||
        (right.friend.next_due_at &&
          new Date(right.friend.next_due_at).getTime()) ||
        Infinity;
      return leftKey - rightKey;
    });
    caughtUp.sort((left, right) => {
      const leftMs = left.friend.last_caught_up_at
        ? new Date(left.friend.last_caught_up_at).getTime()
        : 0;
      const rightMs = right.friend.last_caught_up_at
        ? new Date(right.friend.last_caught_up_at).getTime()
        : 0;
      return rightMs - leftMs;
    });

    const sections: Section[] = [];
    if (awaitingFollowup.length > 0) {
      sections.push({
        kind: "header",
        title: formatLifecycleState("awaiting_followup"),
        count: awaitingFollowup.length,
        state: "awaiting_followup",
      });
      for (const row of awaitingFollowup)
        sections.push({ kind: "friend", row });
    }
    if (scheduled.length > 0) {
      sections.push({
        kind: "header",
        title: formatLifecycleState("scheduled"),
        count: scheduled.length,
        state: "scheduled",
      });
      for (const row of scheduled) sections.push({ kind: "friend", row });
    }
    if (due.length > 0) {
      sections.push({
        kind: "header",
        title: formatLifecycleState("due"),
        count: due.length,
        state: "due",
      });
      for (const row of due) sections.push({ kind: "friend", row });
    }
    if (caughtUp.length > 0) {
      sections.push({
        kind: "header",
        title: formatLifecycleState("caught_up"),
        count: caughtUp.length,
        state: "caught_up",
      });
      for (const row of caughtUp) sections.push({ kind: "friend", row });
    }
    return sections;
  }, [data, scheduledEvents, missedEvents, search]);

  const stickyHeaderIndices = useMemo(
    () =>
      sections.reduce<number[]>((indices, section, index) => {
        if (section.kind === "header") indices.push(index);
        return indices;
      }, []),
    [sections],
  );

  const hasFriends = !!data && data.length > 0;

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold text-default dark:text-default-dk">
          Catchup
        </Text>
        <Link href={ROUTES.friend.pickContact} asChild>
          <Pressable className="h-10 w-10 rounded-full bg-raised dark:bg-raised-dk items-center justify-center active:bg-high dark:active:bg-high-dk">
            <Ionicons name="add" size={22} color={colors.fgDefault} />
          </Pressable>
        </Link>
      </View>

      {hasFriends ? (
        <View className="mb-4">
          <Input
            placeholder="Search friends"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      ) : null}

      {true || (isLoading && !data) ? (
        <View
          className="flex-1 items-center justify-center"
          style={{ paddingBottom: tabBarHeight + 24 }}
        >
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      ) : error ? (
        <Text className="text-danger dark:text-danger-dk">
          Failed to load friends: {(error as Error).message}
        </Text>
      ) : !hasFriends ? (
        <View className="flex-1" style={{ paddingBottom: tabBarHeight }}>
          <EmptyState
            icon="people-outline"
            title="No friends yet"
            description="Add a friend to start tracking your catch-ups."
            cta={{
              label: "Add your first friend",
              href: ROUTES.friend.pickContact,
            }}
          />
        </View>
      ) : sections.length === 0 ? (
        <View
          className="flex-1 items-center justify-center"
          style={{ paddingBottom: tabBarHeight }}
        >
          <Text className="text-muted dark:text-muted-dk">
            {`No friends match “${search.trim()}”`}
          </Text>
        </View>
      ) : (
        <FlatList
          className="-mx-4"
          data={sections}
          keyExtractor={(section, index) =>
            section.kind === "header"
              ? `h-${section.title}-${index}`
              : `f-${section.row.friend.id}`
          }
          ItemSeparatorComponent={({
            leadingItem,
          }: {
            leadingItem: Section;
          }) => (
            <View className={leadingItem?.kind === "header" ? "h-0" : "h-1"} />
          )}
          renderItem={({ item, index }) =>
            item.kind === "header" ? (
              <View className="bg-app dark:bg-app-dk pb-2 px-4 flex-row items-center gap-2">
                <Ionicons
                  name={SECTION_ICONS[item.state]}
                  size={16}
                  color={colors.fgMuted}
                />
                <Text className="text-base font-medium text-muted dark:text-muted-dk">
                  {item.title}
                </Text>
                <DashedDivider className="flex-1" />
              </View>
            ) : (
              <>
                <FriendListItem
                  friend={item.row.friend}
                  action={item.row.action}
                  whenAt={item.row.whenAt}
                  scheduledEventId={item.row.scheduledEventId}
                  missedAt={item.row.missedAt}
                  isDue={item.row.isDue}
                />
                {sections[index + 1]?.kind === "header" ? (
                  <View className="h-4" />
                ) : null}
              </>
            )
          }
          refreshing={isRefetching}
          onRefresh={refetch}
          stickyHeaderIndices={stickyHeaderIndices}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          scrollIndicatorInsets={{ bottom: tabBarHeight }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Screen>
  );
};

export default FriendsScreen;
