// TODO: Review
import { z } from "zod";

export const frequencyUnitSchema = z.enum(["days", "weeks", "months"]);
export const frequencyPresetSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "3_months",
  "6_months",
  "yearly",
  "custom",
]);

export const mediumSchema = z.enum([
  "text",
  "call",
  "video",
  "in_person",
  "email",
]);
export const eventStatusSchema = z.enum([
  "scheduled",
  "completed",
  "missed",
  "cancelled",
]);

export const friendInputSchema = z
  .object({
    first_name: z.string().trim().min(1, "First name is required").max(100),
    last_name: z
      .string()
      .trim()
      .max(100)
      .transform((value) => (value === "" ? null : value))
      .nullable()
      .optional(),
    frequency_preset: frequencyPresetSchema.nullable().optional(),
    frequency_amount: z.number().int().positive().nullable().optional(),
    frequency_unit: frequencyUnitSchema.nullable().optional(),
  })
  .refine(
    (friend) =>
      (friend.frequency_preset == null &&
        friend.frequency_amount == null &&
        friend.frequency_unit == null) ||
      (friend.frequency_preset != null &&
        friend.frequency_amount != null &&
        friend.frequency_unit != null),
    { message: "Frequency preset, amount, and unit must all be set together" },
  );

export type FriendInput = z.infer<typeof friendInputSchema>;

export const eventInputSchema = z.object({
  friend_id: z.string().uuid(),
  event_at: z.string().datetime(),
  status: eventStatusSchema,
  medium: mediumSchema.nullable().optional(),
  medium_detail: z.string().max(200).nullable().optional(),
  location_text: z.string().max(200).nullable().optional(),
  location_address: z.string().max(500).nullable().optional(),
  pre_reminder_minutes: z.number().int().nonnegative().nullable().optional(),
  event_notes: z.string().max(5000).nullable().optional(),
});

export type EventInput = z.infer<typeof eventInputSchema>;
