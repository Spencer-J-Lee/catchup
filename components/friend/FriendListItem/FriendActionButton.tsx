import classNames from "classnames";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text } from "react-native";

import type { FriendWithStatus } from "@/hooks/use-friends";
import { ROUTES } from "@/lib/routes";

export type FriendItemAction =
  | "schedule"
  | "checkin"
  | "reschedule"
  | "followup";

const ACTION_META: Record<
  FriendItemAction,
  { label: string; primary: boolean }
> = {
  schedule: { label: "Schedule", primary: true },
  checkin: { label: "Check in", primary: false },
  reschedule: { label: "Re-schedule", primary: false },
  followup: { label: "Follow up", primary: true },
};

const resolveHref = (
  friendId: string,
  action: FriendItemAction,
  scheduledEventId: string | null | undefined,
): Href => {
  if (action === "followup" && scheduledEventId) {
    return ROUTES.event.detail(scheduledEventId);
  }

  if (action === "reschedule" && scheduledEventId) {
    return ROUTES.event.edit(scheduledEventId);
  }

  if (action === "schedule") {
    return ROUTES.event.new({ friend_id: friendId, mode: "schedule" });
  }

  return ROUTES.event.new({ friend_id: friendId, mode: "checkin" });
};

interface FriendActionButtonProps {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledEventId?: string | null;
}

export const FriendActionButton = ({
  friend,
  action,
  scheduledEventId,
}: FriendActionButtonProps) => {
  const router = useRouter();
  const meta = ACTION_META[action];

  const onPress = () => {
    router.push(resolveHref(friend.id, action, scheduledEventId));
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className={classNames(
        "rounded-full px-4 py-2",
        meta.primary
          ? "bg-brand-300 active:bg-brand-400"
          : "bg-surface-elevated active:bg-surface-high",
      )}
    >
      <Text
        className={classNames(
          "text-sm font-medium",
          meta.primary ? "text-surface" : "text-fg",
        )}
      >
        {meta.label}
      </Text>
    </Pressable>
  );
};
