import { supabase } from "@/lib/supabase";
import type { ContactSnapshot } from "@/lib/contacts";
import type {
  CadencePreset,
  CadenceUnit,
  EventStatus,
  Friend,
  Medium,
} from "@/types/database";

// Trailing middle dot on last_name marks a row as seed data. Chosen to look
// like an unobtrusive character rather than an obvious tag, so the data
// resembles real entries while staying easy to identify for cleanup.
const SEED_MARKER = "·";

function mark(lastName: string): string {
  return `${lastName}${SEED_MARKER}`;
}

interface SeedContact {
  /** Synthetic id — the native Contact card open will fail gracefully if tapped. */
  id: string;
  snapshot: ContactSnapshot;
  syncedDaysAgo: number;
}

interface SeedFriend {
  first_name: string;
  last_name: string | null;
  general_notes: string | null;
  cadence_preset: CadencePreset | null;
  cadence_amount: number | null;
  cadence_unit: CadenceUnit | null;
  avatar_url: string | null;
  /** When set, populates contact_id / contact_snapshot / contact_synced_at to simulate a linked phone contact. */
  contact: SeedContact | null;
  /** How many days ago this friend was "created" — used to back-date created_at for the no-events fallback. */
  createdDaysAgo: number;
  events: SeedEvent[];
}

function avatarFor(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}`;
}

function contactFor(args: {
  id: string;
  name: string;
  phone: string;
  email: string;
  imageUri?: string | null;
  syncedDaysAgo: number;
}): SeedContact {
  return {
    id: args.id,
    syncedDaysAgo: args.syncedDaysAgo,
    snapshot: {
      name: args.name,
      phone: args.phone,
      email: args.email,
      phones: [{ label: "mobile", number: args.phone }],
      emails: [{ label: "personal", email: args.email }],
      image_uri: args.imageUri ?? null,
    },
  };
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
  pre_reminder_minutes?: number | null;
}

function isoOffsetDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

const FRIENDS: SeedFriend[] = [
  // scenario: ~30d overdue (weekly cadence), linked contact
  {
    first_name: "Alex",
    last_name: mark("Chen"),
    general_notes: "College roommate. Loves climbing.",
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: avatarFor("alex-chen"),
    contact: contactFor({
      id: "seed-contact-alex-chen",
      name: "Alex Chen",
      phone: "+14155550181",
      email: "alex.chen@example.com",
      imageUri: avatarFor("alex-chen"),
      syncedDaysAgo: 30,
    }),
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
  // scenario: reaching out via missed_pending — last completion is much older than
  // the missed event, so the auto-flow surfaces a "Missed Nd ago" hint (also long
  // overdue by cadence, but the missed event wins state priority). Linked contact w/o avatar.
  {
    first_name: "Bailey",
    last_name: mark("Park"),
    general_notes: "From the Boston team. Has two kids; partner's name is Sam.",
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: null,
    contact: contactFor({
      id: "seed-contact-bailey-park",
      name: "Bailey Park",
      phone: "+16175550144",
      email: "bailey.park@example.com",
      syncedDaysAgo: 90,
    }),
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
        event_notes:
          "Missed — they had to cancel last minute, never rescheduled.",
      },
    ],
  },
  // scenario: 1d overdue (weekly cadence), unlinked
  {
    first_name: "Cam",
    last_name: mark("Rivera"),
    general_notes: null,
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: null,
    contact: null,
    createdDaysAgo: 90,
    events: [
      {
        offsetDays: -8,
        status: "completed",
        medium: "in_person",
        medium_detail: null,
        location_text: "Sightglass",
        location_address: "270 7th St, San Francisco, CA",
        event_notes:
          "Walked through their startup idea. Interesting but very early.",
      },
    ],
  },
  // scenario: 1d overdue (monthly cadence), linked contact
  {
    first_name: "Dana",
    last_name: mark("Wu"),
    general_notes: null,
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: avatarFor("dana-wu"),
    contact: contactFor({
      id: "seed-contact-dana-wu",
      name: "Dana Wu",
      phone: "+12065550199",
      email: "dana.wu@example.com",
      imageUri: avatarFor("dana-wu"),
      syncedDaysAgo: 60,
    }),
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
  // scenario: never caught up (no events), recently linked contact
  {
    first_name: "Eli",
    last_name: mark("Brooks"),
    general_notes:
      "Met at conference last month — promised to keep in touch but haven't yet.",
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: null,
    contact: contactFor({
      id: "seed-contact-eli-brooks",
      name: "Eli Brooks",
      phone: "+13105550172",
      email: "eli.brooks@example.com",
      syncedDaysAgo: 5,
    }),
    createdDaysAgo: 60,
    events: [],
  },
  // scenario: due tomorrow, has an upcoming scheduled event w/ pre-reminder
  {
    first_name: "Faye",
    last_name: mark("Holloway"),
    general_notes: null,
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: avatarFor("faye-holloway"),
    contact: contactFor({
      id: "seed-contact-faye-holloway",
      name: "Faye Holloway",
      phone: "+19175550127",
      email: "faye.holloway@example.com",
      imageUri: avatarFor("faye-holloway"),
      syncedDaysAgo: 14,
    }),
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
        pre_reminder_minutes: 30,
      },
    ],
  },
  // scenario: due in 3 weeks, exercises a long hyphenated last name for layout
  // and includes a prior-year completed event to exercise the year-on-history-date display
  {
    first_name: "Gabriella",
    last_name: mark("Constantinopoulos-Whitfield"),
    general_notes: "Old high school friend. Lives in Athens now.",
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: null,
    contact: null,
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
        event_notes:
          "Cancelled — she had a work emergency. Rescheduled the week after.",
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
      {
        offsetDays: -220,
        status: "completed",
        medium: "in_person",
        medium_detail: null,
        location_text: "Her parents' place",
        location_address: "Pasadena, CA",
        event_notes:
          "She was back stateside for the holidays. Long catch-up over wine.",
      },
    ],
  },
  // scenario: caught up 2d ago (6-month cadence, not due), linked contact
  {
    first_name: "Harper",
    last_name: mark("Singh"),
    general_notes: null,
    cadence_preset: "6_months",
    cadence_amount: 6,
    cadence_unit: "months",
    avatar_url: avatarFor("harper-singh"),
    contact: contactFor({
      id: "seed-contact-harper-singh",
      name: "Harper Singh",
      phone: "+14085550113",
      email: "harper.singh@example.com",
      imageUri: avatarFor("harper-singh"),
      syncedDaysAgo: 45,
    }),
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
  // scenario: no cadence set, unlinked
  {
    first_name: "Indra",
    last_name: mark("Olamide"),
    general_notes: "Loose connection. Catch up whenever.",
    cadence_preset: null,
    cadence_amount: null,
    cadence_unit: null,
    avatar_url: null,
    contact: null,
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
  // scenario: scheduled event 2d in the past — awaiting follow-up (mark complete/missed/cancelled)
  {
    first_name: "Kai",
    last_name: mark("Nakamura"),
    general_notes: "Used to work together. Always great to catch up.",
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: avatarFor("kai-nakamura"),
    contact: contactFor({
      id: "seed-contact-kai-nakamura",
      name: "Kai Nakamura",
      phone: "+12135550168",
      email: "kai.nakamura@example.com",
      imageUri: avatarFor("kai-nakamura"),
      syncedDaysAgo: 20,
    }),
    createdDaysAgo: 150,
    events: [
      {
        offsetDays: -34,
        status: "completed",
        medium: "call",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: "Talked about their team change. Sounds promising.",
      },
      {
        offsetDays: -2,
        status: "scheduled",
        medium: "in_person",
        medium_detail: null,
        location_text: "Blue Bottle",
        location_address: "66 Mint St, San Francisco, CA",
        event_notes: "Coffee before their flight out.",
        pre_reminder_minutes: 60,
      },
    ],
  },
  // scenario: clean missed_pending — cadence says not yet due, but a recent missed
  // event after the last completion pulls the friend into "Reaching out" with
  // "Missed Nd ago" as the only signal. Tests the missed→reaching-out auto-flow
  // independent of overdue cadence.
  {
    first_name: "Marlowe",
    last_name: mark("Quinn"),
    general_notes: "Quarterly-ish coffee. Tried to reconnect after a gap.",
    cadence_preset: "monthly",
    cadence_amount: 1,
    cadence_unit: "months",
    avatar_url: avatarFor("marlowe-quinn"),
    contact: contactFor({
      id: "seed-contact-marlowe-quinn",
      name: "Marlowe Quinn",
      phone: "+15035550136",
      email: "marlowe.quinn@example.com",
      imageUri: avatarFor("marlowe-quinn"),
      syncedDaysAgo: 25,
    }),
    createdDaysAgo: 180,
    events: [
      {
        offsetDays: -15,
        status: "completed",
        medium: "call",
        medium_detail: null,
        location_text: null,
        location_address: null,
        event_notes: "Short catch-up — agreed to grab coffee in a couple weeks.",
      },
      {
        offsetDays: -3,
        status: "missed",
        medium: "in_person",
        medium_detail: null,
        location_text: "Ritual Coffee",
        location_address: "1026 Valencia St, San Francisco, CA",
        event_notes: "They had to bail last minute. Never rescheduled.",
      },
    ],
  },
  // scenario: 3d overdue, long hyphenated last name for layout, scheduled event w/ day-ahead reminder
  {
    first_name: "Jules",
    last_name: mark("Marchetti-Andersen"),
    general_notes: null,
    cadence_preset: "weekly",
    cadence_amount: 1,
    cadence_unit: "weeks",
    avatar_url: avatarFor("jules-marchetti"),
    contact: null,
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
        pre_reminder_minutes: 1440,
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
    .like("last_name", `%${SEED_MARKER}`);
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
    contact_id: f.contact?.id ?? null,
    contact_snapshot: f.contact
      ? (f.contact.snapshot as unknown as Record<string, unknown>)
      : null,
    contact_synced_at: f.contact ? isoOffsetDays(-f.contact.syncedDaysAgo) : null,
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
    `${f.first_name} ${f.last_name ?? ""}`;
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
        scheduled_at:
          isScheduled || e.status === "cancelled" || e.status === "missed"
            ? ts
            : null,
        occurred_at: e.status === "completed" ? ts : null,
        status: e.status,
        medium: e.medium,
        medium_detail: e.medium_detail,
        location_text: e.location_text,
        location_address: e.location_address,
        event_notes: e.event_notes,
        pre_reminder_minutes: e.pre_reminder_minutes ?? null,
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
