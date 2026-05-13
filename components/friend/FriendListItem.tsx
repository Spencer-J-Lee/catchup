import { Link, useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatRelative } from "@/lib/format";
import type { FriendWithStatus } from "@/hooks/use-friends";

export type FriendItemAction = "schedule" | "checkin" | "reschedule";

interface Props {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledAt?: string | null;
  scheduledEventId?: string | null;
  isDue?: boolean;
}

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const ACTION_META: Record<
  FriendItemAction,
  { label: string; primary: boolean }
> = {
  schedule: { label: "Schedule", primary: true },
  checkin: { label: "Check in", primary: false },
  reschedule: { label: "Re-schedule", primary: false },
};

export function FriendListItem({
  friend,
  action,
  scheduledAt,
  scheduledEventId,
  isDue,
}: Props) {
  const router = useRouter();

  const hideLastLabel = action === "reschedule" || isDue;
  const lastLabel =
    !hideLastLabel && friend.last_caught_up_at
      ? `Last caught up ${formatRelative(friend.last_caught_up_at)}`
      : null;

  let subLabel: string | null = null;
  let subClass = "text-gray-500";
  if (action === "reschedule" && scheduledAt) {
    subLabel = `Scheduled ${formatRelative(scheduledAt)}`;
    subClass = "text-blue-700 font-medium";
  } else if (isDue && friend.next_due_at) {
    const due = new Date(friend.next_due_at);
    const now = new Date();
    const overdueDays = Math.max(1, daysBetween(now, due));
    subLabel = `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
    subClass = "text-red-600 font-semibold";
  } else if (friend.next_due_at) {
    subLabel = `Due ${formatRelative(friend.next_due_at)}`;
  }

  const meta = ACTION_META[action];

  const actionHref: Href =
    action === "reschedule" && scheduledEventId
      ? { pathname: "/event/[id]/edit", params: { id: scheduledEventId } }
      : action === "schedule"
        ? { pathname: "/event/new", params: { friend_id: friend.id, mode: "schedule" } }
        : { pathname: "/event/new", params: { friend_id: friend.id, mode: "checkin" } };

  function onActionPress() {
    router.push(actionHref);
  }

  return (
    <Link href={`/friend/${friend.id}`} asChild>
      <Pressable className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{friend.display_name}</Text>
          {lastLabel ? (
            <Text className="text-sm text-gray-500 mt-1">{lastLabel}</Text>
          ) : null}
          {subLabel ? (
            <Text className={`text-sm mt-0.5 ${subClass}`}>{subLabel}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={onActionPress}
          hitSlop={8}
          className={`rounded-full px-3 py-2 ${
            meta.primary
              ? "bg-brand-600 active:bg-brand-700"
              : "bg-gray-100 active:bg-gray-200"
          }`}
        >
          <Text
            className={`text-sm font-medium ${meta.primary ? "text-white" : "text-gray-900"}`}
          >
            {meta.label}
          </Text>
        </Pressable>
      </Pressable>
    </Link>
  );
}
