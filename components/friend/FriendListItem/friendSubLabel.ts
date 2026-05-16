import type { FriendWithStatus } from "@/hooks/use-friends";
import { formatOverdueDays, formatRelative } from "@/lib/format";

import type { FriendItemAction } from "./FriendActionButton";

interface SubLabelArgs {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledAt?: string | null;
  missedAt?: string | null;
  isDue?: boolean;
}

export const getFriendSubLabelData = ({
  friend,
  action,
  scheduledAt,
  missedAt,
  isDue,
}: SubLabelArgs): { label: string; className: string } => {
  if (action === "followup" && scheduledAt) {
    return {
      label: `Was scheduled ${formatRelative(scheduledAt)}`,
      className: "text-brand-300 font-medium",
    };
  }

  if (action === "reschedule" && scheduledAt) {
    return {
      label: `Scheduled ${formatRelative(scheduledAt)}`,
      className: "text-brand-300 font-medium",
    };
  }

  if (action === "schedule" && missedAt) {
    return {
      label: `Missed ${formatRelative(missedAt)}`,
      className: "text-brand-300 font-medium",
    };
  }

  if (action === "schedule" && friend.next_due_at) {
    return {
      label: formatOverdueDays(friend.next_due_at),
      className: "text-brand-300 font-medium",
    };
  }

  if (friend.last_caught_up_at) {
    return {
      label: `Checked in ${formatRelative(friend.last_caught_up_at)}`,
      className: isDue ? "text-brand-300 font-medium" : "text-fg-muted",
    };
  }

  return {
    label: "No catch-ups yet",
    className: isDue ? "text-brand-300 font-medium" : "text-fg-muted",
  };
};
