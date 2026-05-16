import type { CadencePreset, CadenceUnit } from "@/types/database";

export interface CadenceValue {
  preset: CadencePreset | null;
  amount: number | null;
  unit: CadenceUnit | null;
}

export const DEFAULT_CADENCE_UNIT: CadenceUnit = "weeks";
