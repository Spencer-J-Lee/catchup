import { Ionicons } from "@expo/vector-icons";
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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useMissedEvents, useScheduledEvents } from "@/hooks/use-events";
import { useFriends, type FriendWithStatus } from "@/hooks/use-friends";
import { colors } from "@/lib/colors";
import { deriveFriendState } from "@/lib/lifecycle";
import { ROUTES } from "@/lib/routes";

type FriendRow = {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledAt: string | null;
  scheduledEventId: string | null;
  missedAt: string | null;
  isDue: boolean;
};

type Section =
  | { kind: "header"; title: string; count: number }
  | { kind: "friend"; row: FriendRow };

const FriendsScreen = () => {
  const { data, isLoading, error, refetch, isRefetching } = useFriends();
  const { data: scheduledEvents } = useScheduledEvents();
  const { data: missedEvents } = useMissedEvents();
  const [search, setSearch] = useState("");

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    const now = new Date();
    const nowMs = now.getTime();

    type ScheduledRef = { id: string; scheduled_at: string };
    const pastByFriend = new Map<string, ScheduledRef>();
    const upcomingByFriend = new Map<string, ScheduledRef>();
    for (const event of scheduledEvents ?? []) {
      if (!event.scheduled_at) continue;
      const scheduledMs = new Date(event.scheduled_at).getTime();
      const isPast = scheduledMs < nowMs;
      const bucket = isPast ? pastByFriend : upcomingByFriend;
      const existing = bucket.get(event.friend_id);
      // Past: keep the oldest (longest awaiting). Upcoming: keep the soonest.
      const replace =
        !existing || scheduledMs < new Date(existing.scheduled_at).getTime();
      if (replace) {
        bucket.set(event.friend_id, {
          id: event.id,
          scheduled_at: event.scheduled_at,
        });
      }
    }

    const recentMissedByFriend = new Map<string, ScheduledRef>();
    for (const event of missedEvents ?? []) {
      if (!event.scheduled_at) continue;
      const existing = recentMissedByFriend.get(event.friend_id);
      if (
        !existing ||
        new Date(event.scheduled_at).getTime() >
          new Date(existing.scheduled_at).getTime()
      ) {
        recentMissedByFriend.set(event.friend_id, {
          id: event.id,
          scheduled_at: event.scheduled_at,
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
          action: "followup",
          scheduledAt: past.scheduled_at,
          scheduledEventId: past.id,
          missedAt: null,
          isDue: true,
        });
      } else if (state === "scheduled" && upcoming) {
        scheduled.push({
          friend,
          action: "reschedule",
          scheduledAt: upcoming.scheduled_at,
          scheduledEventId: upcoming.id,
          missedAt: null,
          isDue: false,
        });
      } else if (state === "due") {
        // Surface a "missed N days ago" hint when the auto-flow kicked in.
        const missedAt = missed
          ? !friend.last_caught_up_at ||
            new Date(missed.scheduled_at).getTime() >
              new Date(friend.last_caught_up_at).getTime()
            ? missed.scheduled_at
            : null
          : null;
        due.push({
          friend,
          action: "schedule",
          scheduledAt: null,
          scheduledEventId: null,
          missedAt,
          isDue: true,
        });
      } else {
        caughtUp.push({
          friend,
          action: "checkin",
          scheduledAt: null,
          scheduledEventId: null,
          missedAt: null,
          isDue: false,
        });
      }
    }

    awaitingFollowup.sort(
      (left, right) =>
        new Date(left.scheduledAt!).getTime() -
        new Date(right.scheduledAt!).getTime(),
    );
    scheduled.sort(
      (left, right) =>
        new Date(left.scheduledAt!).getTime() -
        new Date(right.scheduledAt!).getTime(),
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
        title: "Awaiting follow-up",
        count: awaitingFollowup.length,
      });
      for (const row of awaitingFollowup)
        sections.push({ kind: "friend", row });
    }
    if (scheduled.length > 0) {
      sections.push({
        kind: "header",
        title: "Scheduled",
        count: scheduled.length,
      });
      for (const row of scheduled) sections.push({ kind: "friend", row });
    }
    if (due.length > 0) {
      sections.push({
        kind: "header",
        title: "Due",
        count: due.length,
      });
      for (const row of due) sections.push({ kind: "friend", row });
    }
    if (caughtUp.length > 0) {
      sections.push({
        kind: "header",
        title: "Caught up",
        count: caughtUp.length,
      });
      for (const row of caughtUp) sections.push({ kind: "friend", row });
    }
    return sections;
  }, [data, scheduledEvents, missedEvents, search]);

  const hasFriends = !!data && data.length > 0;

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold text-fg">Catchup</Text>
        <Link href={ROUTES.friend.pickContact} asChild>
          <Pressable className="h-10 w-10 rounded-full bg-surface-elevated items-center justify-center active:bg-surface-high">
            <Ionicons name="add" size={22} color={colors.fg.DEFAULT} />
          </Pressable>
        </Link>
      </View>

      {hasFriends ? (
        <View className="mb-3">
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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.fg.DEFAULT} />
        </View>
      ) : error ? (
        <Text className="text-danger-400">
          Failed to load friends: {(error as Error).message}
        </Text>
      ) : !hasFriends ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-full bg-surface-elevated items-center justify-center mb-5">
            <Ionicons
              name="people-outline"
              size={36}
              color={colors.brand[300]}
            />
          </View>
          <Text className="text-xl font-semibold text-fg mb-2">
            No friends yet
          </Text>
          <Text className="text-fg-muted text-center mb-6">
            Add a friend to start tracking your catch-ups.
          </Text>
          <Link href={ROUTES.friend.pickContact} asChild>
            <Button className="px-6">Add your first friend</Button>
          </Link>
        </View>
      ) : sections.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-fg-muted">
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
          renderItem={({ item }) =>
            item.kind === "header" ? (
              <View className="mt-4 mb-1 px-4">
                <Text className="text-base font-normal text-fg-muted">
                  {item.title}
                </Text>
              </View>
            ) : (
              <FriendListItem
                friend={item.row.friend}
                action={item.row.action}
                scheduledAt={item.row.scheduledAt}
                scheduledEventId={item.row.scheduledEventId}
                missedAt={item.row.missedAt}
                isDue={item.row.isDue}
              />
            )
          }
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Screen>
  );
};

export default FriendsScreen;
