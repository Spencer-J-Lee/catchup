import type { ContactSnapshot } from "@/lib/contacts";
import type {
  EventStatus,
  FrequencyPreset,
  FrequencyUnit,
  Medium,
} from "@/types/database";

export interface SeedContact {
  /** Synthetic id — the native Contact card open will fail gracefully if tapped. */
  id: string;
  snapshot: ContactSnapshot;
  syncedDaysAgo: number;
}

export interface SeedEvent {
  /** Offset in days from now. Negative = past, positive = future. */
  offsetDays: number;
  /** Local hour-of-day (0-23) to anchor the event to. Defaults to current wall-clock hour. */
  atHour?: number;
  /** Local minute (0-59). Defaults to 0 when atHour is set, otherwise current wall-clock minute. */
  atMinute?: number;
  status: EventStatus;
  medium: Medium | null;
  medium_detail: string | null;
  location_text: string | null;
  location_address: string | null;
  event_notes: string | null;
  pre_reminder_minutes?: number | null;
}

export interface SeedFriend {
  first_name: string;
  last_name: string | null;
  frequency_preset: FrequencyPreset | null;
  frequency_amount: number | null;
  frequency_unit: FrequencyUnit | null;
  avatar_url: string | null;
  /** When set, populates contact_id / contact_snapshot / contact_synced_at to simulate a linked phone contact. */
  contact: SeedContact | null;
  /** How many days ago this friend was "created" — used to back-date created_at for the no-events fallback. */
  createdDaysAgo: number;
  events: SeedEvent[];
}

export interface SeedResult {
  friendsCreated: number;
  eventsCreated: number;
  friendsDeleted: number;
}
