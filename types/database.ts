// Facade over the auto-generated Supabase types in ./database.generated.
// Regen the generated file with:
//   supabase gen types typescript --linked > types/database.generated.ts
//
// The generated columns use plain `string` for CHECK-constrained text columns
// (medium, status, cadence_preset, cadence_unit, platform). The narrow unions
// below match the CHECK values in supabase/migrations/0001_init.sql and stay
// in sync with lib/schemas.ts.

import type { Database } from "./database.generated";

export type { Database, Json } from "./database.generated";
export { Constants } from "./database.generated";

export type CadencePreset =
  | "daily"
  | "weekly"
  | "monthly"
  | "3_months"
  | "6_months"
  | "yearly"
  | "custom";

export type CadenceUnit = "days" | "weeks" | "months";

export type Medium = "text" | "call" | "video" | "in_person";

export type EventStatus = "scheduled" | "completed" | "missed" | "cancelled";

export type Platform = "ios" | "android";

type FriendRow = Database["public"]["Tables"]["friends"]["Row"];
type CatchUpEventRow = Database["public"]["Tables"]["catch_up_events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PushTokenRow = Database["public"]["Tables"]["push_tokens"]["Row"];
type FriendCadenceStatusRow =
  Database["public"]["Views"]["friend_cadence_status"]["Row"];

export type Friend = Omit<
  FriendRow,
  "cadence_preset" | "cadence_unit" | "contact_snapshot"
> & {
  cadence_preset: CadencePreset | null;
  cadence_unit: CadenceUnit | null;
  contact_snapshot: Record<string, unknown> | null;
};

export type CatchUpEvent = Omit<CatchUpEventRow, "medium" | "status"> & {
  medium: Medium | null;
  status: EventStatus;
};

export type Profile = ProfileRow;

export type PushToken = Omit<PushTokenRow, "platform"> & {
  platform: Platform;
};

export type FriendCadenceStatus = Omit<FriendCadenceStatusRow, "cadence_unit"> & {
  cadence_unit: CadenceUnit | null;
};
