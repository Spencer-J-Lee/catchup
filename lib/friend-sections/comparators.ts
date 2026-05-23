// TODO: BEEG REVIEW 1

import type { FriendRow } from "./types";

export const compareByWhenAt = (left: FriendRow, right: FriendRow): number =>
  new Date(left.whenAt!).getTime() - new Date(right.whenAt!).getTime();

export const compareDueRows = (left: FriendRow, right: FriendRow): number => {
  // Missed friends first; within each group, sort by the relevant timestamp.
  if (!!left.missedAt !== !!right.missedAt) {
    return left.missedAt ? -1 : 1;
  }
  const leftKey =
    (left.missedAt && new Date(left.missedAt).getTime()) ||
    (left.friend.next_due_at &&
      new Date(left.friend.next_due_at).getTime()) ||
    Infinity;
  const rightKey =
    (right.missedAt && new Date(right.missedAt).getTime()) ||
    (right.friend.next_due_at &&
      new Date(right.friend.next_due_at).getTime()) ||
    Infinity;
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
