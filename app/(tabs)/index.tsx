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
import { useUpcomingScheduledEvents } from "@/hooks/use-events";

type FriendRow = {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledAt: string | null;
  scheduledEventId: string | null;
  isDue: boolean;
};

type Section =
  | { kind: "header"; title: string; count: number }
  | { kind: "friend"; row: FriendRow };

export default function FriendsScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useFriends();
  const { data: scheduledEvents } = useUpcomingScheduledEvents();
  const [search, setSearch] = useState("");

  const sections = useMemo<Section[]>(() => {
    if (!data) return [];
    const now = Date.now();

    const nextScheduledByFriend = new Map<
      string,
      { id: string; scheduled_at: string }
    >();
    for (const ev of scheduledEvents ?? []) {
      if (!ev.scheduled_at) continue;
      const existing = nextScheduledByFriend.get(ev.friend_id);
      if (
        !existing ||
        new Date(ev.scheduled_at).getTime() <
          new Date(existing.scheduled_at).getTime()
      ) {
        nextScheduledByFriend.set(ev.friend_id, {
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

    const scheduled: FriendRow[] = [];
    const due: FriendRow[] = [];
    const notDue: FriendRow[] = [];

    for (const f of filtered) {
      const next = nextScheduledByFriend.get(f.id);
      if (next) {
        scheduled.push({
          friend: f,
          action: "reschedule",
          scheduledAt: next.scheduled_at,
          scheduledEventId: next.id,
          isDue: false,
        });
        continue;
      }
      const isOverdue =
        f.next_due_at != null && new Date(f.next_due_at).getTime() < now;
      if (isOverdue) {
        due.push({
          friend: f,
          action: "schedule",
          scheduledAt: null,
          scheduledEventId: null,
          isDue: true,
        });
      } else {
        notDue.push({
          friend: f,
          action: "checkin",
          scheduledAt: null,
          scheduledEventId: null,
          isDue: false,
        });
      }
    }

    scheduled.sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime(),
    );
    due.sort((a, b) => {
      const ad = new Date(a.friend.next_due_at!).getTime();
      const bd = new Date(b.friend.next_due_at!).getTime();
      return ad - bd;
    });
    notDue.sort((a, b) => {
      const at = a.friend.last_caught_up_at
        ? new Date(a.friend.last_caught_up_at).getTime()
        : 0;
      const bt = b.friend.last_caught_up_at
        ? new Date(b.friend.last_caught_up_at).getTime()
        : 0;
      return bt - at;
    });

    const out: Section[] = [];
    if (due.length > 0) {
      out.push({ kind: "header", title: "Due", count: due.length });
      for (const r of due) out.push({ kind: "friend", row: r });
    }
    if (scheduled.length > 0) {
      out.push({ kind: "header", title: "Scheduled", count: scheduled.length });
      for (const r of scheduled) out.push({ kind: "friend", row: r });
    }
    if (notDue.length > 0) {
      out.push({ kind: "header", title: "Not due", count: notDue.length });
      for (const r of notDue) out.push({ kind: "friend", row: r });
    }
    return out;
  }, [data, scheduledEvents, search]);

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
        <Text className="text-red-400">
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
              <View className="mt-4 mb-1">
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
}
