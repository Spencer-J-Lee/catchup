// Catch-up lifecycle — single source of truth.
//
// A friend's lifecycle state is derived from their events + frequency; it is not
// stored. The DB-level `catch_up_events.status` enum (scheduled/completed/
// missed/cancelled) remains the system of record. This module maps from those
// per-event facts to a per-friend state used by the home screen.
//
//        ┌───────────────────────────────── repeat ───────────────────────────────┐
//        ▼                                                                        │
//   ┌──────────┐ schedule  ┌───────────────────┐                                  │
//   │ On track │──────────▶│ Time to reconnect │                                  │
//   └──────────┘           └───────────────────┘                                  │
//        ▲                          │  ▲                                          │
//        │ cancel                   │  │ miss (auto-flow)                         │
//        │ (keeps history)          ▼  │                                          │
//        │                  ┌────────────┐  time passes  ┌──────────────┐         │
//        │   ◀──────────────│ On its way │──────────────▶│ How'd it go? │─────────┘
//        │                  └────────────┘               └──────────────┘
//        │                        │  ▲                          │
//        │                        │  │ reschedule               │ complete
//        │                        └──┘                          │
//        └──────────────────── complete ─────────────────────── ▼

import type { CatchUpEvent } from "@/types/database";

export type FriendLifecycleState =
  | "caught_up"
  | "due"
  | "scheduled"
  | "awaiting_followup";

export type LifecycleReason =
  | "no_activity"
  | "not_yet_due"
  | "completed_recent"
  | "overdue"
  | "missed_pending"
  | "upcoming_scheduled"
  | "past_scheduled_needs_resolution";

export interface DeriveFriendStateInput {
  /** From `friend_frequency_status.next_due_at` — null if no frequency. */
  nextDueAt: string | null;
  /** From `friend_frequency_status.last_caught_up_at`. */
  lastCaughtUpAt: string | null;
  /** Latest scheduled event with `scheduled_at` > now. */
  upcomingScheduled: Pick<CatchUpEvent, "id" | "scheduled_at"> | null;
  /** Oldest scheduled event with `scheduled_at` <= now (still unresolved). */
  pastScheduled: Pick<CatchUpEvent, "id" | "scheduled_at"> | null;
  /** Most recent event with status='missed'. */
  recentMissed: Pick<CatchUpEvent, "id" | "scheduled_at"> | null;
  now: Date;
}

export interface FriendStateResult {
  state: FriendLifecycleState;
  reason: LifecycleReason;
}

export const deriveFriendState = (
  args: DeriveFriendStateInput,
): FriendStateResult => {
  const nowMs = args.now.getTime();

  // 1. A scheduled event sitting in the past beats everything — the user
  //    needs to mark complete / missed / cancelled before the friend's state
  //    can advance.
  if (args.pastScheduled) {
    return {
      state: "awaiting_followup",
      reason: "past_scheduled_needs_resolution",
    };
  }

  // 2. Future scheduled event → Scheduled.
  if (args.upcomingScheduled) {
    return { state: "scheduled", reason: "upcoming_scheduled" };
  }

  // 3. Most recent activity was a miss → Due (auto-flow back).
  //    Compare against last_caught_up_at so a stale miss doesn't outrank a
  //    subsequent completion.
  if (args.recentMissed?.scheduled_at) {
    const missedMs = new Date(args.recentMissed.scheduled_at).getTime();
    const completedMs = args.lastCaughtUpAt
      ? new Date(args.lastCaughtUpAt).getTime()
      : -Infinity;
    if (missedMs > completedMs) {
      return { state: "due", reason: "missed_pending" };
    }
  }

  // 4. Frequency says overdue → Due.
  if (args.nextDueAt && new Date(args.nextDueAt).getTime() < nowMs) {
    return { state: "due", reason: "overdue" };
  }

  // 5. Caught up — either caught up recently, or no activity yet.
  if (args.lastCaughtUpAt) {
    return {
      state: "caught_up",
      reason: args.nextDueAt ? "not_yet_due" : "completed_recent",
    };
  }
  return { state: "caught_up", reason: "no_activity" };
};

export const formatLifecycleState = (state: FriendLifecycleState): string => {
  switch (state) {
    case "caught_up":
      return "On track";
    case "due":
      return "Time to reconnect";
    case "scheduled":
      return "On its way";
    case "awaiting_followup":
      return "How'd it go?";
  }
};
