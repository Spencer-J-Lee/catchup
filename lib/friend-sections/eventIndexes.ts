// TODO: BEEG REVIEW 1

import type { CatchUpEvent } from "@/types/database";

import type { EventIndexes, EventRef } from "./types";

export const buildEventIndexes = (
  scheduledEvents: CatchUpEvent[] | undefined,
  nowMs: number,
): EventIndexes => {
  const pastByFriend = new Map<string, EventRef>();
  const upcomingByFriend = new Map<string, EventRef>();
  for (const event of scheduledEvents ?? []) {
    const scheduledMs = new Date(event.event_at).getTime();
    const isPast = scheduledMs < nowMs;
    const bucket = isPast ? pastByFriend : upcomingByFriend;
    const existing = bucket.get(event.friend_id);
    // Past: keep the oldest (longest awaiting). Upcoming: keep the soonest.
    const replace =
      !existing || scheduledMs < new Date(existing.event_at).getTime();
    if (replace) {
      bucket.set(event.friend_id, { id: event.id, event_at: event.event_at });
    }
  }

  return { pastByFriend, upcomingByFriend };
};
