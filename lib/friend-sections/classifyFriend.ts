// TODO: BEEG REVIEW 1

import type { FriendWithStatus } from "@/hooks/use-friends";

import { deriveFriendState, type FriendLifecycleState } from "../lifecycle";
import type { EventIndexes, FriendRow } from "./types";

export interface ClassifiedFriend {
  state: FriendLifecycleState;
  row: FriendRow;
}

export const classifyFriend = (
  friend: FriendWithStatus,
  indexes: EventIndexes,
  now: Date,
): ClassifiedFriend => {
  const past = indexes.pastByFriend.get(friend.id) ?? null;
  const upcoming = indexes.upcomingByFriend.get(friend.id) ?? null;
  const missed = indexes.recentMissedByFriend.get(friend.id) ?? null;

  const { state } = deriveFriendState({
    nextDueAt: friend.next_due_at,
    lastCaughtUpAt: friend.last_caught_up_at,
    upcomingScheduled: upcoming,
    pastScheduled: past,
    recentMissed: missed,
    now,
  });

  if (state === "awaiting_followup" && past) {
    return {
      state: "awaiting_followup",
      row: {
        friend,
        action: "followUp",
        whenAt: past.event_at,
        scheduledEventId: past.id,
        missedAt: null,
        isDue: true,
      },
    };
  }

  if (state === "scheduled" && upcoming) {
    return {
      state: "scheduled",
      row: {
        friend,
        action: "edit",
        whenAt: upcoming.event_at,
        scheduledEventId: upcoming.id,
        missedAt: null,
        isDue: false,
      },
    };
  }

  if (state === "due") {
    // Surface a "missed N days ago" hint when the auto-flow kicked in.
    const missedAt = missed
      ? !friend.last_caught_up_at ||
        new Date(missed.event_at).getTime() >
          new Date(friend.last_caught_up_at).getTime()
        ? missed.event_at
        : null
      : null;
    return {
      state: "due",
      row: {
        friend,
        action: "schedule",
        whenAt: null,
        scheduledEventId: null,
        missedAt,
        isDue: true,
      },
    };
  }

  return {
    state: "caught_up",
    row: {
      friend,
      action: null,
      whenAt: null,
      scheduledEventId: null,
      missedAt: null,
      isDue: false,
    },
  };
};
