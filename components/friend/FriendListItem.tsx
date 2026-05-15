import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter, type Href } from "expo-router";
import { useRef } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import {
  formatOverdueDays,
  formatRelative,
  fullName,
  initialsOf,
} from "@/lib/format";
import { useDeleteFriend, type FriendWithStatus } from "@/hooks/use-friends";

export type FriendItemAction =
  | "schedule"
  | "checkin"
  | "reschedule"
  | "followup";

interface Props {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledAt?: string | null;
  scheduledEventId?: string | null;
  /** When set and `action === "schedule"`, render a "Missed X ago" hint —
   * signals the missed→reaching-out auto-flow. */
  missedAt?: string | null;
  isDue?: boolean;
}

const ACTION_META: Record<
  FriendItemAction,
  { label: string; primary: boolean }
> = {
  schedule: { label: "Schedule", primary: true },
  checkin: { label: "Check in", primary: false },
  reschedule: { label: "Re-schedule", primary: false },
  followup: { label: "Follow up", primary: true },
};

export function FriendListItem({
  friend,
  action,
  scheduledAt,
  scheduledEventId,
  missedAt,
  isDue,
}: Props) {
  const router = useRouter();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const del = useDeleteFriend();

  function onDeletePress() {
    Alert.alert(
      `Delete ${fullName(friend)}?`,
      "This will also delete all catch-up history.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            del.mutate(friend.id);
          },
        },
      ],
    );
  }

  function renderRightActions() {
    return (
      <Pressable
        onPress={onDeletePress}
        className="w-20 bg-red-600 active:bg-red-700 items-center justify-center"
      >
        <Ionicons name="trash" size={22} color="#ffffff" />
      </Pressable>
    );
  }

  let subLabel: string;
  let subClass: string;
  if (action === "followup" && scheduledAt) {
    subLabel = `Was scheduled ${formatRelative(scheduledAt)}`;
    subClass = "text-brand-300 font-medium";
  } else if (action === "reschedule" && scheduledAt) {
    subLabel = `Scheduled ${formatRelative(scheduledAt)}`;
    subClass = "text-brand-300 font-medium";
  } else if (action === "schedule" && missedAt) {
    subLabel = `Missed ${formatRelative(missedAt)}`;
    subClass = "text-brand-300 font-medium";
  } else if (action === "schedule" && friend.next_due_at) {
    subLabel = formatOverdueDays(friend.next_due_at);
    subClass = "text-brand-300 font-medium";
  } else if (friend.last_caught_up_at) {
    subLabel = `Checked in ${formatRelative(friend.last_caught_up_at)}`;
    subClass = isDue ? "text-brand-300 font-medium" : "text-fg-muted";
  } else {
    subLabel = "No catch-ups yet";
    subClass = isDue ? "text-brand-300 font-medium" : "text-fg-muted";
  }

  const meta = ACTION_META[action];

  const actionHref: Href =
    action === "followup" && scheduledEventId
      ? { pathname: "/event/[id]", params: { id: scheduledEventId } }
      : action === "reschedule" && scheduledEventId
        ? { pathname: "/event/[id]/edit", params: { id: scheduledEventId } }
        : action === "schedule"
          ? {
              pathname: "/event/new",
              params: { friend_id: friend.id, mode: "schedule" },
            }
          : {
              pathname: "/event/new",
              params: { friend_id: friend.id, mode: "checkin" },
            };

  function onActionPress() {
    router.push(actionHref);
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      friction={2}
      overshootRight={false}
    >
      <Link href={`/friend/${friend.id}`} asChild>
        <Pressable className="flex-row items-center gap-3 py-2 px-4 bg-surface active:opacity-70">
          {friend.avatar_url ? (
            <Image
              source={{ uri: friend.avatar_url }}
              className="h-14 w-14 rounded-full bg-surface-elevated"
              resizeMode="cover"
            />
          ) : (
            <View className="h-14 w-14 rounded-full bg-surface-elevated items-center justify-center">
              <Text className="text-fg text-base font-semibold">
                {initialsOf(friend.first_name, friend.last_name)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-fg">
              {fullName(friend)}
            </Text>
            <Text className={`text-sm mt-0.5 ${subClass}`}>{subLabel}</Text>
          </View>
          <Pressable
            onPress={onActionPress}
            hitSlop={8}
            className={`rounded-full px-4 py-2 ${
              meta.primary
                ? "bg-brand-300 active:bg-brand-400"
                : "bg-surface-elevated active:bg-surface-high"
            }`}
          >
            <Text
              className={`text-sm font-medium ${meta.primary ? "text-surface" : "text-fg"}`}
            >
              {meta.label}
            </Text>
          </Pressable>
        </Pressable>
      </Link>
    </ReanimatedSwipeable>
  );
}
