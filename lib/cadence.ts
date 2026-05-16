import { addDays, addMonths, addWeeks, differenceInDays } from "date-fns";

import type { CadencePreset, CadenceUnit } from "@/types/database";

export interface CadenceValue {
  preset: CadencePreset;
  amount: number;
  unit: CadenceUnit;
}

export const CADENCE_PRESETS: Record<
  Exclude<CadencePreset, "custom">,
  { label: string; amount: number; unit: CadenceUnit }
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
  unit: CadenceUnit,
): CadencePreset => {
  const match = (
    Object.entries(CADENCE_PRESETS) as [
      Exclude<CadencePreset, "custom">,
      { amount: number; unit: CadenceUnit },
    ][]
  ).find(([, preset]) => preset.amount === amount && preset.unit === unit);
  return match ? match[0] : "custom";
};

export const addCadence = (
  date: Date,
  amount: number,
  unit: CadenceUnit,
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

export interface CadenceStatus {
  lastCaughtUpAt: Date | null;
  nextDueAt: Date | null;
  daysUntilDue: number | null;
  isOverdue: boolean;
}

export const computeCadenceStatus = (args: {
  lastCaughtUpAt: Date | null;
  cadenceAmount: number | null;
  cadenceUnit: CadenceUnit | null;
  fallbackStart: Date; // friend's created_at, used when no completed events exist
  now?: Date;
}): CadenceStatus => {
  const now = args.now ?? new Date();
  if (args.cadenceAmount == null || args.cadenceUnit == null) {
    return {
      lastCaughtUpAt: args.lastCaughtUpAt,
      nextDueAt: null,
      daysUntilDue: null,
      isOverdue: false,
    };
  }
  const base = args.lastCaughtUpAt ?? args.fallbackStart;
  const due = addCadence(base, args.cadenceAmount, args.cadenceUnit);
  const daysUntilDue = differenceInDays(due, now);
  return {
    lastCaughtUpAt: args.lastCaughtUpAt,
    nextDueAt: due,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
  };
};
