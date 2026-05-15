// Catch-up lifecycle — single source of truth.
//
// A friend's lifecycle state is derived from their events + cadence; it is not
// stored. The DB-level `catch_up_events.status` enum (scheduled/completed/
// missed/cancelled) remains the system of record. This module maps from those
// per-event facts to a per-friend state used by the home screen.
//
//        ┌──────────────────────────────── repeat ────────────────────────────┐
//        ▼                                                                    │
//   ┌────────┐  schedule   ┌──────────────┐                                   │
//   │  Idle  │────────────▶│ Reaching out │                                   │
//   └────────┘             └──────────────┘                                   │
//        ▲                       │  ▲                                         │
//        │ cancel                │  │ miss (auto-flow)                        │
//        │ (keeps history)       ▼  │                                         │
//        │                  ┌───────────┐  time passes  ┌───────────────────┐ │
//        │   ◀──────────────│ Scheduled │──────────────▶│ Awaiting follow-up│─┘
//        │                  └───────────┘               └───────────────────┘
//        │                       │  ▲                          │
//        │                       │  │ reschedule               │ complete
//        │                       └──┘                          │
//        └─────────────────── complete ─────────────────────── ▼

import type { CatchUpEvent } from "@/types/database";

export type FriendLifecycleState =
  | "idle"
  | "reaching_out"
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
  /** From `friend_cadence_status.next_due_at` — null if no cadence. */
  nextDueAt: string | null;
  /** From `friend_cadence_status.last_caught_up_at`. */
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

  // 3. Most recent activity was a miss → Reaching out (auto-flow back).
  //    Compare against last_caught_up_at so a stale miss doesn't outrank a
  //    subsequent completion.
  if (args.recentMissed?.scheduled_at) {
    const missedMs = new Date(args.recentMissed.scheduled_at).getTime();
    const completedMs = args.lastCaughtUpAt
      ? new Date(args.lastCaughtUpAt).getTime()
      : -Infinity;
    if (missedMs > completedMs) {
      return { state: "reaching_out", reason: "missed_pending" };
    }
  }

  // 4. Cadence says overdue → Reaching out.
  if (args.nextDueAt && new Date(args.nextDueAt).getTime() < nowMs) {
    return { state: "reaching_out", reason: "overdue" };
  }

  // 5. Idle — either caught up recently, or no activity yet.
  if (args.lastCaughtUpAt) {
    return {
      state: "idle",
      reason: args.nextDueAt ? "not_yet_due" : "completed_recent",
    };
  }
  return { state: "idle", reason: "no_activity" };
};

export const formatLifecycleState = (s: FriendLifecycleState): string => {
  switch (s) {
    case "idle":
      return "Idle";
    case "reaching_out":
      return "Reaching out";
    case "scheduled":
      return "Scheduled";
    case "awaiting_followup":
      return "Awaiting follow-up";
  }
};
