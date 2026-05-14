import { supabase } from "@/lib/supabase";
import type {
  CadencePreset,
  CadenceUnit,
  EventStatus,
  Friend,
  Medium,
} from "@/types/database";

const SEED_PREFIX = "[Seed]";

interface SeedFriend {
  first_name: string;
  last_name: string | null;
  general_notes: string | null;
  cadence_preset: CadencePreset | null;
  cadence_amount: number | null;
  cadence_unit: CadenceUnit | null;
  avatar_url: string | null;
  /** How many days ago this friend was "created" — used to back-date created_at for the no-events fallback. */
  createdDaysAgo: number;
  events: SeedEvent[];
}

function avatarFor(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}`;
}

interface SeedEvent {
  /** Offset in days from now. Negative = past, positive = future. */
  offsetDays: number;
  status: EventStatus;
  medium: Medium | null;
  medium_detail: string | null;
  location_text: string | null;
  location_address: string | null;
  event_notes: string | null;
}

function isoOffsetDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

const FRIENDS: SeedFriend[] = [
  {
    first_name: `${SEED_PREFIX} Alex`,
    last_name: "Chen — ~30d overdue",
    general_notes: "College roommate. Loves climbing.",
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: avatarFor("alex-chen"),
    createdDaysAgo: 200,
    events: [
      {
        offsetDays: -37,
        status: "completed",
        medium: "text",
        medium_detail: "iMessage",
        location_text: null,
        location_address: null,
        event_notes:
          "Quick check-in. Said the new job is going well but they've been swamped.\n\nWants to do a climbing trip in summer.",
      },
      {
        offsetDays: -70,
        status: "completed",
        medium: "call",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: null,
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Bailey`,
    last_name: "Park — 100d overdue",
    general_notes:
      "From the Boston team. Has two kids; partner's name is Sam.",
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: null,
    createdDaysAgo: 365,
    events: [
      {
        offsetDays: -107,
        status: "completed",
        medium: "video",
        medium_detail: "Zoom",
        location_text: null,
        location_address: null,
        event_notes: "Caught up about the move. They love the new place.",
      },
      {
        offsetDays: -40,
        status: "missed",
        medium: null,
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: "Missed — they had to cancel last minute, never rescheduled.",
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Cam`,
    last_name: "Rivera — 1d overdue",
    general_notes: null,
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: null,
    createdDaysAgo: 90,
    events: [
      {
        offsetDays: -8,
        status: "completed",
        medium: "in_person",
        medium_detail: null,
        location_text: "Sightglass",
        location_address: "270 7th St, San Francisco, CA",
        event_notes: "Walked through their startup idea. Interesting but very early.",
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Dana`,
    last_name: "Wu — 1d overdue (monthly)",
    general_notes: null,
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: avatarFor("dana-wu"),
    createdDaysAgo: 120,
    events: [
      {
        offsetDays: -32,
        status: "completed",
        medium: "call",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: null,
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Eli`,
    last_name: "Brooks — never caught up",
    general_notes:
      "Met at conference last month — promised to keep in touch but haven't yet.",
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: null,
    createdDaysAgo: 60,
    events: [],
  },
  {
    first_name: `${SEED_PREFIX} Faye`,
    last_name: "Holloway — due tomorrow",
    general_notes: null,
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: avatarFor("faye-holloway"),
    createdDaysAgo: 40,
    events: [
      {
        offsetDays: -6,
        status: "completed",
        medium: "text",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: "Short chat — they were on the way out.",
      },
      {
        offsetDays: 1.2,
        status: "scheduled",
        medium: "video",
        medium_detail: "FaceTime",
        location_text: null,
        location_address: null,
        event_notes: "Planning to catch up about their new role.",
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Gabriella`,
    last_name: "Constantinopoulos-Whitfield — due in 3 weeks",
    general_notes: "Old high school friend. Lives in Athens now.",
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: null,
    createdDaysAgo: 400,
    events: [
      {
        offsetDays: -7,
        status: "completed",
        medium: "video",
        medium_detail: "Whatsapp",
        location_text: null,
        location_address: null,
        event_notes: "She's planning to visit in the fall.",
      },
      {
        offsetDays: -45,
        status: "cancelled",
        medium: "video",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: "Cancelled — she had a work emergency. Rescheduled the week after.",
      },
      {
        offsetDays: -38,
        status: "completed",
        medium: "video",
        medium_detail: "Whatsapp",
        location_text: null,
        location_address: null,
        event_notes: null,
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Harper`,
    last_name: "Singh — caught up 2d ago",
    general_notes: null,
    cadence_preset: "6_months",
    cadence_amount: 6,
    cadence_unit: "months",
    avatar_url: avatarFor("harper-singh"),
    createdDaysAgo: 200,
    events: [
      {
        offsetDays: -2,
        status: "completed",
        medium: "in_person",
        medium_detail: null,
        location_text: "Liholiho Yacht Club",
        location_address: "871 Sutter St, San Francisco, CA",
        event_notes:
          "Long catch-up — talked about the move, the new job, and their plans for the next year. Going to introduce me to their friend Sasha who's also in design.",
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Indra`,
    last_name: "Olamide — no cadence set",
    general_notes: "Loose connection. Catch up whenever.",
    cadence_preset: null,
    cadence_amount: null,
    cadence_unit: null,
    avatar_url: null,
    createdDaysAgo: 90,
    events: [
      {
        offsetDays: -14,
        status: "completed",
        medium: "text",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: null,
      },
    ],
  },
  {
    first_name: `${SEED_PREFIX} Jules`,
    last_name: "Marchetti-Andersen — overdue 3d, long name for layout",
    general_notes: null,
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: avatarFor("jules-marchetti"),
    createdDaysAgo: 90,
    events: [
      {
        offsetDays: -10,
        status: "completed",
        medium: "call",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: "They were driving — kept it short.",
      },
      {
        offsetDays: 5,
        status: "scheduled",
        medium: "in_person",
        medium_detail: null,
        location_text: "Tartine Manufactory",
        location_address: "595 Alabama St, San Francisco, CA",
        event_notes: null,
      },
    ],
  },
];

export interface SeedResult {
  friendsCreated: number;
  eventsCreated: number;
  friendsDeleted: number;
}

export async function clearSeedData(userId: string): Promise<number> {
  const { data: existing, error: selErr } = await supabase
    .from("friends")
    .select("id")
    .eq("user_id", userId)
    .like("first_name", `${SEED_PREFIX}%`);
  if (selErr) throw selErr;
  const ids = (existing ?? []).map((f) => f.id);
  if (ids.length === 0) return 0;
  // Events cascade via FK on delete.
  const { error: delErr } = await supabase
    .from("friends")
    .delete()
    .in("id", ids);
  if (delErr) throw delErr;
  return ids.length;
}

export async function seedExampleData(userId: string): Promise<SeedResult> {
  const friendsDeleted = await clearSeedData(userId);

  const friendRows = FRIENDS.map((f) => ({
    user_id: userId,
    first_name: f.first_name,
    last_name: f.last_name,
    general_notes: f.general_notes,
    cadence_preset: f.cadence_preset,
    cadence_amount: f.cadence_amount,
    cadence_unit: f.cadence_unit,
    avatar_url: f.avatar_url,
    created_at: isoOffsetDays(-f.createdDaysAgo),
  }));

  const { data: inserted, error: insErr } = await supabase
    .from("friends")
    .insert(friendRows)
    .select("id, first_name, last_name");
  if (insErr) throw insErr;
  const insertedFriends = (inserted ?? []) as Pick<
    Friend,
    "id" | "first_name" | "last_name"
  >[];

  const keyOf = (f: { first_name: string; last_name: string | null }) =>
    `${f.first_name} ${f.last_name ?? ""}`;
  const byName = new Map(insertedFriends.map((f) => [keyOf(f), f.id]));
  const eventRows = FRIENDS.flatMap((f) => {
    const fid = byName.get(keyOf(f));
    if (!fid) return [];
    return f.events.map((e) => {
      const ts = isoOffsetDays(e.offsetDays);
      const isScheduled = e.status === "scheduled";
      return {
        user_id: userId,
        friend_id: fid,
        scheduled_at: isScheduled || e.status === "cancelled" || e.status === "missed" ? ts : null,
        occurred_at: e.status === "completed" ? ts : null,
        status: e.status,
        medium: e.medium,
        medium_detail: e.medium_detail,
        location_text: e.location_text,
        location_address: e.location_address,
        event_notes: e.event_notes,
      };
    });
  });

  let eventsCreated = 0;
  if (eventRows.length > 0) {
    const { error: evErr, count } = await supabase
      .from("catch_up_events")
      .insert(eventRows, { count: "exact" });
    if (evErr) throw evErr;
    eventsCreated = count ?? eventRows.length;
  }

  return {
    friendsCreated: insertedFriends.length,
    eventsCreated,
    friendsDeleted,
  };
}
