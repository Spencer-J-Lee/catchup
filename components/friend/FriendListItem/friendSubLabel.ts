import type { FriendWithStatus } from "@/hooks/use-friends";
import { formatOverdueDays, formatRelative } from "@/lib/format";

import type { FriendItemAction } from "./types";

interface SubLabelArgs {
  friend: FriendWithStatus;
  action?: FriendItemAction | null;
  scheduledAt?: string | null;
  missedAt?: string | null;
  isDue?: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isWithinOneCalendarDay = (scheduledAt: string): boolean => {
  const scheduled = new Date(scheduledAt);
  const now = new Date();
  const scheduledMidnight = new Date(
    scheduled.getFullYear(),
    scheduled.getMonth(),
    scheduled.getDate(),
  ).getTime();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  return scheduledMidnight - todayMidnight <= MS_PER_DAY;
};

const MUTED = "text-muted dark:text-muted-dk";
const BRAND = "text-brand dark:text-brand-dk";

export const getFriendSubLabelData = ({
  friend,
  action,
  scheduledAt,
  missedAt,
  isDue,
}: SubLabelArgs): { label: string; className: string } => {
  if (action === "followUp" && scheduledAt) {
    return {
      label: `Catch-up was ${formatRelative(scheduledAt)}`,
      className: `${MUTED} font-medium`,
    };
  }

  if (action === "reschedule" && scheduledAt) {
    const isImminent = isWithinOneCalendarDay(scheduledAt);

    return {
      label: `Coming up ${formatRelative(scheduledAt)}`,
      className: isImminent ? `${BRAND} font-medium` : MUTED,
    };
  }

  if (action === "schedule" && missedAt) {
    return {
      label: `Missed ${formatRelative(missedAt)}`,
      className: `${BRAND} font-medium`,
    };
  }

  if (action === "schedule" && friend.next_due_at) {
    return {
      label: formatOverdueDays(friend.next_due_at),
      className: `${BRAND} font-medium`,
    };
  }

  if (friend.last_caught_up_at) {
    return {
      label: `Last connected ${formatRelative(friend.last_caught_up_at)}`,
      className: isDue ? `${BRAND} font-medium` : MUTED,
    };
  }

  return {
    label: "No catch-ups yet",
    className: isDue ? `${BRAND} font-medium` : MUTED,
  };
};
