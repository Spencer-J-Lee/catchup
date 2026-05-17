import { addDays, addMonths, addWeeks, differenceInDays } from "date-fns";

import type { FrequencyPreset, FrequencyUnit } from "@/types/database";

export interface FrequencyValue {
  preset: FrequencyPreset;
  amount: number;
  unit: FrequencyUnit;
}

export const FREQUENCY_PRESETS: Record<
  Exclude<FrequencyPreset, "custom">,
  { label: string; amount: number; unit: FrequencyUnit }
> = {
  daily: { label: "Daily", amount: 1, unit: "days" },
  weekly: { label: "Weekly", amount: 1, unit: "weeks" },
  monthly: { label: "Monthly", amount: 1, unit: "months" },
  "3_months": { label: "Every 3 months", amount: 3, unit: "months" },
  "6_months": { label: "Every 6 months", amount: 6, unit: "months" },
  yearly: { label: "Yearly", amount: 12, unit: "months" },
};

export const presetFromAmount = (
  amount: number,
  unit: FrequencyUnit,
): FrequencyPreset => {
  const match = (
    Object.entries(FREQUENCY_PRESETS) as [
      Exclude<FrequencyPreset, "custom">,
      { amount: number; unit: FrequencyUnit },
    ][]
  ).find(([, preset]) => preset.amount === amount && preset.unit === unit);
  return match ? match[0] : "custom";
};

export const addFrequency = (
  date: Date,
  amount: number,
  unit: FrequencyUnit,
): Date => {
  switch (unit) {
    case "days":
      return addDays(date, amount);
    case "weeks":
      return addWeeks(date, amount);
    case "months":
      return addMonths(date, amount);
  }
};

export interface FrequencyStatus {
  lastCaughtUpAt: Date | null;
  nextDueAt: Date | null;
  daysUntilDue: number | null;
  isOverdue: boolean;
}

export const computeFrequencyStatus = (args: {
  lastCaughtUpAt: Date | null;
  frequencyAmount: number | null;
  frequencyUnit: FrequencyUnit | null;
  fallbackStart: Date; // friend's created_at, used when no completed events exist
  now?: Date;
}): FrequencyStatus => {
  const now = args.now ?? new Date();
  if (args.frequencyAmount == null || args.frequencyUnit == null) {
    return {
      lastCaughtUpAt: args.lastCaughtUpAt,
      nextDueAt: null,
      daysUntilDue: null,
      isOverdue: false,
    };
  }
  const base = args.lastCaughtUpAt ?? args.fallbackStart;
  const due = addFrequency(base, args.frequencyAmount, args.frequencyUnit);
  const daysUntilDue = differenceInDays(due, now);
  return {
    lastCaughtUpAt: args.lastCaughtUpAt,
    nextDueAt: due,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
  };
};
