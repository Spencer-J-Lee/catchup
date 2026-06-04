// TODO: BEEG REVIEW 1

import type { FriendRow } from "./types";

export const compareByWhenAt = (left: FriendRow, right: FriendRow): number =>
  new Date(left.whenAt!).getTime() - new Date(right.whenAt!).getTime();

export const compareDueRows = (left: FriendRow, right: FriendRow): number => {
  // Longest overdue first; friends without a due date sort last.
  const leftKey = left.friend.next_due_at
    ? new Date(left.friend.next_due_at).getTime()
    : Infinity;
  const rightKey = right.friend.next_due_at
    ? new Date(right.friend.next_due_at).getTime()
    : Infinity;
  return leftKey - rightKey;
};

export const compareCaughtUp = (left: FriendRow, right: FriendRow): number => {
  const leftMs = left.friend.last_caught_up_at
    ? new Date(left.friend.last_caught_up_at).getTime()
    : 0;
  const rightMs = right.friend.last_caught_up_at
    ? new Date(right.friend.last_caught_up_at).getTime()
    : 0;
  return rightMs - leftMs;
};
