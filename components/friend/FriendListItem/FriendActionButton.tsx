import { useRouter } from "expo-router";

import { Pill } from "@/components/ui/Pill";
import type { FriendWithStatus } from "@/hooks/use-friends";

import { resolveFriendActionHref } from "./friendActionHref";
import type { FriendItemAction } from "./types";

const ACTION_META: Record<
  FriendItemAction,
  { label: string; primary: boolean }
> = {
  schedule: { label: "Schedule", primary: true },
  logCatchUp: { label: "Log catch-up", primary: false },
  reschedule: { label: "Re-schedule", primary: false },
  followUp: { label: "Follow up", primary: true },
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
    router.push(resolveFriendActionHref(friend.id, action, scheduledEventId));
  };

  return (
    <Pill
      variant={meta.primary ? "primary" : "secondary"}
      label={meta.label}
      onPress={onPress}
      hitSlop={8}
    />
  );
};
