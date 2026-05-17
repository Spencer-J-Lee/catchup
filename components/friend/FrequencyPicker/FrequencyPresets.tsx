import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { FREQUENCY_PRESETS } from "@/lib/frequency";
import type { FrequencyPreset } from "@/types/database";

import { DEFAULT_FREQUENCY_UNIT, type FrequencyValue } from "./types";

interface FrequencyPresetsProps {
  value: FrequencyValue;
  onChange: (value: FrequencyValue) => void;
}

const PRESET_KEYS: Exclude<FrequencyPreset, "custom">[] = [
  "daily",
  "weekly",
  "monthly",
  "3_months",
  "6_months",
  "yearly",
];

export const FrequencyPresets = ({
  value,
  onChange,
}: FrequencyPresetsProps) => {
  return (
    <ChipRow>
      <Chip
        label="None"
        selected={value.preset === null}
        onPress={() => onChange({ preset: null, amount: null, unit: null })}
      />

      {PRESET_KEYS.map((key) => {
        const preset = FREQUENCY_PRESETS[key];

        return (
          <Chip
            key={key}
            label={preset.label}
            selected={value.preset === key}
            onPress={() =>
              onChange({
                preset: key,
                amount: preset.amount,
                unit: preset.unit,
              })
            }
          />
        );
      })}

      <Chip
        label="Custom"
        selected={value.preset === "custom"}
        onPress={() =>
          onChange({
            preset: "custom",
            amount: value.amount,
            unit: value.unit ?? DEFAULT_FREQUENCY_UNIT,
          })
        }
      />
    </ChipRow>
  );
};
