import type { FriendWithStatus } from "@/hooks/use-friends";

import type { FriendItemAction } from "./types";

interface SubLabelArgs {
  friend: FriendWithStatus;
  action?: FriendItemAction | null;
  whenAt?: string | null;
  missedAt?: string | null;
  isDue?: boolean;
  formatRelative: (date: Date | string) => string;
  formatOverdueDays: (date: Date | string) => string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isWithinOneCalendarDay = (whenAt: string): boolean => {
  const scheduled = new Date(whenAt);
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
const URGENT = "text-accent dark:text-accent-dk";

export const getFriendSubLabelData = ({
  friend,
  action,
  whenAt,
  missedAt,
  isDue,
  formatRelative,
  formatOverdueDays,
}: SubLabelArgs): { label: string; className: string } => {
  if (action === "followUp" && whenAt) {
    return {
      label: `Catch-up was ${formatRelative(whenAt)}`,
      className: `${MUTED} font-medium`,
    };
  }

  if (action === "edit" && whenAt) {
    const isImminent = isWithinOneCalendarDay(whenAt);

    return {
      label: `Coming up ${formatRelative(whenAt)}`,
      className: isImminent ? `${URGENT} font-medium` : MUTED,
    };
  }

  if (action === "schedule" && missedAt) {
    return {
      label: `Missed ${formatRelative(missedAt)}`,
      className: `${URGENT} font-medium`,
    };
  }

  if (action === "schedule" && friend.next_due_at) {
    return {
      label: formatOverdueDays(friend.next_due_at),
      className: `${URGENT} font-medium`,
    };
  }

  if (friend.last_caught_up_at) {
    return {
      label: `Last connected ${formatRelative(friend.last_caught_up_at)}`,
      className: isDue ? `${URGENT} font-medium` : MUTED,
    };
  }

  return {
    label: "No catch-ups yet",
    className: isDue ? `${URGENT} font-medium` : MUTED,
  };
};
