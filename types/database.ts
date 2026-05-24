// Facade over the auto-generated Supabase types in ./database.generated.
// Regen the generated file with:
//   supabase gen types typescript --linked > types/database.generated.ts
//
// The generated columns use plain `string` for CHECK-constrained text columns
// (medium, status, frequency_preset, frequency_unit, platform). The narrow
// unions below match the CHECK values in supabase/migrations/0001_init.sql.
// The first four are inferred from the Zod schemas in lib/schemas.ts so the
// runtime validators and the compile-time types can't drift apart.

import type { z } from "zod";

import type {
  eventStatusSchema,
  frequencyPresetSchema,
  frequencyUnitSchema,
  mediumSchema,
} from "@/lib/schemas";

import type { Database } from "./database.generated";

export { Constants } from "./database.generated";
export type { Database, Json } from "./database.generated";

export type FrequencyPreset = z.infer<typeof frequencyPresetSchema>;

export type FrequencyUnit = z.infer<typeof frequencyUnitSchema>;

export type Medium = z.infer<typeof mediumSchema>;

export type EventStatus = z.infer<typeof eventStatusSchema>;

export type Platform = "ios" | "android";

type FriendRow = Database["public"]["Tables"]["friends"]["Row"];
type CatchUpEventRow = Database["public"]["Tables"]["catch_up_events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PushTokenRow = Database["public"]["Tables"]["push_tokens"]["Row"];
type FriendFrequencyStatusRow =
  Database["public"]["Views"]["friend_frequency_status"]["Row"];

export type Friend = Omit<
  FriendRow,
  "frequency_preset" | "frequency_unit" | "contact_snapshot"
> & {
  frequency_preset: FrequencyPreset | null;
  frequency_unit: FrequencyUnit | null;
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

export type FriendFrequencyStatus = Omit<
  FriendFrequencyStatusRow,
  "frequency_unit"
> & {
  frequency_unit: FrequencyUnit | null;
};
