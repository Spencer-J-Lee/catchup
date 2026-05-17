import type { FrequencyPreset, FrequencyUnit } from "@/types/database";

export interface FrequencyValue {
  preset: FrequencyPreset | null;
  amount: number | null;
  unit: FrequencyUnit | null;
}

export const DEFAULT_FREQUENCY_UNIT: FrequencyUnit = "weeks";
