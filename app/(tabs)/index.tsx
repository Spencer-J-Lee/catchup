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
import { useFriends, type FriendWithStatus } from "@/hooks/use-friends";
import { useMissedEvents, useScheduledEvents } from "@/hooks/use-events";
import { deriveFriendState } from "@/lib/lifecycle";

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
    for (const ev of scheduledEvents ?? []) {
      if (!ev.scheduled_at) continue;
      const ts = new Date(ev.scheduled_at).getTime();
      const isPast = ts < nowMs;
      const bucket = isPast ? pastByFriend : upcomingByFriend;
      const existing = bucket.get(ev.friend_id);
      // Past: keep the oldest (longest awaiting). Upcoming: keep the soonest.
      const replace =
        !existing ||
        ts < new Date(existing.scheduled_at).getTime();
      if (replace) {
        bucket.set(ev.friend_id, { id: ev.id, scheduled_at: ev.scheduled_at });
      }
    }

    const recentMissedByFriend = new Map<string, ScheduledRef>();
    for (const ev of missedEvents ?? []) {
      if (!ev.scheduled_at) continue;
      const existing = recentMissedByFriend.get(ev.friend_id);
      if (
        !existing ||
        new Date(ev.scheduled_at).getTime() >
          new Date(existing.scheduled_at).getTime()
      ) {
        recentMissedByFriend.set(ev.friend_id, {
          id: ev.id,
          scheduled_at: ev.scheduled_at,
        });
      }
    }

    const q = search.trim().toLowerCase();
    const filtered = q
      ? data.filter((f) =>
          `${f.first_name} ${f.last_name ?? ""}`.toLowerCase().includes(q),
        )
      : data;

    const awaitingFollowup: FriendRow[] = [];
    const scheduled: FriendRow[] = [];
    const reachingOut: FriendRow[] = [];
    const idle: FriendRow[] = [];

    for (const f of filtered) {
      const past = pastByFriend.get(f.id) ?? null;
      const upcoming = upcomingByFriend.get(f.id) ?? null;
      const missed = recentMissedByFriend.get(f.id) ?? null;

      const { state } = deriveFriendState({
        nextDueAt: f.next_due_at,
        lastCaughtUpAt: f.last_caught_up_at,
        upcomingScheduled: upcoming,
        pastScheduled: past,
        recentMissed: missed,
        now,
      });

      if (state === "awaiting_followup" && past) {
        awaitingFollowup.push({
          friend: f,
          action: "followup",
          scheduledAt: past.scheduled_at,
          scheduledEventId: past.id,
          missedAt: null,
          isDue: true,
        });
      } else if (state === "scheduled" && upcoming) {
        scheduled.push({
          friend: f,
          action: "reschedule",
          scheduledAt: upcoming.scheduled_at,
          scheduledEventId: upcoming.id,
          missedAt: null,
          isDue: false,
        });
      } else if (state === "reaching_out") {
        // Surface a "missed N days ago" hint when the auto-flow kicked in.
        const missedAt = missed
          ? (!f.last_caught_up_at ||
              new Date(missed.scheduled_at).getTime() >
                new Date(f.last_caught_up_at).getTime())
            ? missed.scheduled_at
            : null
          : null;
        reachingOut.push({
          friend: f,
          action: "schedule",
          scheduledAt: null,
          scheduledEventId: null,
          missedAt,
          isDue: true,
        });
      } else {
        idle.push({
          friend: f,
          action: "checkin",
          scheduledAt: null,
          scheduledEventId: null,
          missedAt: null,
          isDue: false,
        });
      }
    }

    awaitingFollowup.sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );
    scheduled.sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );
    reachingOut.sort((a, b) => {
      // Prefer overdue cadence sort key; fall back to missed_at; finally name.
      const ak =
        (a.friend.next_due_at && new Date(a.friend.next_due_at).getTime()) ||
        (a.missedAt && new Date(a.missedAt).getTime()) ||
        Infinity;
      const bk =
        (b.friend.next_due_at && new Date(b.friend.next_due_at).getTime()) ||
        (b.missedAt && new Date(b.missedAt).getTime()) ||
        Infinity;
      return ak - bk;
    });
    idle.sort((a, b) => {
      const at = a.friend.last_caught_up_at
        ? new Date(a.friend.last_caught_up_at).getTime()
        : 0;
      const bt = b.friend.last_caught_up_at
        ? new Date(b.friend.last_caught_up_at).getTime()
        : 0;
      return bt - at;
    });

    const out: Section[] = [];
    if (awaitingFollowup.length > 0) {
      out.push({
        kind: "header",
        title: "Awaiting follow-up",
        count: awaitingFollowup.length,
      });
      for (const r of awaitingFollowup) out.push({ kind: "friend", row: r });
    }
    if (reachingOut.length > 0) {
      out.push({
        kind: "header",
        title: "Reaching out",
        count: reachingOut.length,
      });
      for (const r of reachingOut) out.push({ kind: "friend", row: r });
    }
    if (scheduled.length > 0) {
      out.push({ kind: "header", title: "Scheduled", count: scheduled.length });
      for (const r of scheduled) out.push({ kind: "friend", row: r });
    }
    if (idle.length > 0) {
      out.push({ kind: "header", title: "Idle", count: idle.length });
      for (const r of idle) out.push({ kind: "friend", row: r });
    }
    return out;
  }, [data, scheduledEvents, missedEvents, search]);

  const hasFriends = !!data && data.length > 0;

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold text-fg">Catchup</Text>
        <Link href="/friend/pick-contact" asChild>
          <Pressable className="h-10 w-10 rounded-full bg-surface-elevated items-center justify-center active:bg-surface-high">
            <Ionicons name="add" size={22} color="#ffffff" />
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
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : error ? (
        <Text className="text-danger-400">
          Failed to load friends: {(error as Error).message}
        </Text>
      ) : !hasFriends ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-full bg-surface-elevated items-center justify-center mb-5">
            <Ionicons name="people-outline" size={36} color="#f49b7c" />
          </View>
          <Text className="text-xl font-semibold text-fg mb-2">
            No friends yet
          </Text>
          <Text className="text-fg-muted text-center mb-6">
            Add a friend to start tracking your catch-ups.
          </Text>
          <Link href="/friend/pick-contact" asChild>
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
          keyExtractor={(s, i) =>
            s.kind === "header" ? `h-${s.title}-${i}` : `f-${s.row.friend.id}`
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
