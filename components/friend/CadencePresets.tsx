import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { CADENCE_PRESETS } from "@/lib/cadence";
import type { CadencePreset } from "@/types/database";

import { DEFAULT_CADENCE_UNIT, type CadenceValue } from "./CadencePicker";

interface CadencePresetsProps {
  value: CadenceValue;
  onChange: (v: CadenceValue) => void;
}

const PRESET_KEYS: Exclude<CadencePreset, "custom">[] = [
  "daily",
  "weekly",
  "monthly",
  "3_months",
  "6_months",
  "yearly",
];

export const CadencePresets = ({ value, onChange }: CadencePresetsProps) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Chip
        label="None"
        selected={value.preset === null}
        onPress={() => onChange({ preset: null, amount: null, unit: null })}
      />

      {PRESET_KEYS.map((key) => {
        const preset = CADENCE_PRESETS[key];

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
            unit: value.unit ?? DEFAULT_CADENCE_UNIT,
          })
        }
      />
    </View>
  );
};
