import { supabase } from "@/lib/supabase";
import type { Friend, Json } from "@/types/database";

import { FRIENDS } from "./friends";
import { isoOffsetDays, SEED_MARKER } from "./helpers";
import type { SeedResult } from "./types";

export type { SeedResult } from "./types";

export const clearSeedData = async (userId: string): Promise<number> => {
  const { data: existing, error: selErr } = await supabase
    .from("friends")
    .select("id")
    .eq("user_id", userId)
    .like("last_name", `%${SEED_MARKER}`);
  if (selErr) throw selErr;

  const ids = (existing ?? []).map((friend) => friend.id);
  if (ids.length === 0) return 0;

  // Events cascade via FK on delete.
  const { error: delErr } = await supabase
    .from("friends")
    .delete()
    .in("id", ids);
  if (delErr) throw delErr;

  return ids.length;
};

export const seedExampleData = async (userId: string): Promise<SeedResult> => {
  const friendsDeleted = await clearSeedData(userId);

  const friendRows = FRIENDS.map((friend) => ({
    user_id: userId,
    first_name: friend.first_name,
    last_name: friend.last_name,
    frequency_preset: friend.frequency_preset,
    frequency_amount: friend.frequency_amount,
    frequency_unit: friend.frequency_unit,
    avatar_url: friend.avatar_url,
    contact_id: friend.contact?.id ?? null,
    contact_snapshot: friend.contact
      ? (friend.contact.snapshot as unknown as Json)
      : null,
    contact_synced_at: friend.contact
      ? isoOffsetDays(-friend.contact.syncedDaysAgo)
      : null,
    created_at: isoOffsetDays(-friend.createdDaysAgo),
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

  // Map each friend's events back to its inserted row by name. Safe because
  // every seed friend has a unique first/last name; if two ever shared one,
  // their events would collide onto a single row.
  const keyOf = (friend: { first_name: string; last_name: string | null }) =>
    `${friend.first_name} ${friend.last_name ?? ""}`;

  const byName = new Map(
    insertedFriends.map((friend) => [keyOf(friend), friend.id]),
  );

  const eventRows = FRIENDS.flatMap((friend) => {
    const friendId = byName.get(keyOf(friend));
    if (!friendId) return [];

    return friend.events.map((event) => {
      const timestamp = isoOffsetDays(
        event.offsetDays,
        event.atHour,
        event.atMinute,
      );
      return {
        user_id: userId,
        friend_id: friendId,
        event_at: timestamp,
        status: event.status,
        medium: event.medium,
        medium_detail: event.medium_detail,
        location_text: event.location_text,
        location_address: event.location_address,
        event_notes: event.event_notes,
        pre_reminder_minutes: event.pre_reminder_minutes ?? null,
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
};
