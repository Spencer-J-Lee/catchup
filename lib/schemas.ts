import { z } from "zod";

export const cadenceUnitSchema = z.enum(["days", "weeks", "months"]);
export const cadencePresetSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "3_months",
  "6_months",
  "yearly",
  "custom",
]);

export const mediumSchema = z.enum(["text", "call", "video", "in_person"]);
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
    cadence_preset: cadencePresetSchema.nullable().optional(),
    cadence_amount: z.number().int().positive().nullable().optional(),
    cadence_unit: cadenceUnitSchema.nullable().optional(),
  })
  .refine(
    (friend) =>
      (friend.cadence_preset == null &&
        friend.cadence_amount == null &&
        friend.cadence_unit == null) ||
      (friend.cadence_preset != null &&
        friend.cadence_amount != null &&
        friend.cadence_unit != null),
    { message: "Cadence preset, amount, and unit must all be set together" },
  );

export type FriendInput = z.infer<typeof friendInputSchema>;

export const eventInputSchema = z
  .object({
    friend_id: z.string().uuid(),
    scheduled_at: z.string().datetime().nullable().optional(),
    occurred_at: z.string().datetime().nullable().optional(),
    status: eventStatusSchema,
    medium: mediumSchema.nullable().optional(),
    medium_detail: z.string().max(200).nullable().optional(),
    location_text: z.string().max(200).nullable().optional(),
    location_address: z.string().max(500).nullable().optional(),
    pre_reminder_minutes: z.number().int().nonnegative().nullable().optional(),
    event_notes: z.string().max(5000).nullable().optional(),
  })
  .refine((event) => event.scheduled_at != null || event.occurred_at != null, {
    message: "An event must have a scheduled or occurred time",
  })
  .refine(
    (event) => event.status !== "completed" || event.occurred_at != null,
    {
      message: "Completed events must have an occurred_at",
    },
  );

export type EventInput = z.infer<typeof eventInputSchema>;
