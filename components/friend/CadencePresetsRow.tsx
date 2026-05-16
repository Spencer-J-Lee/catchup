import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { CADENCE_PRESETS } from "@/lib/cadence";
import type { CadencePreset } from "@/types/database";

import type { CadenceValue } from "./CadencePicker";

interface CadencePresetsRowProps {
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

export const CadencePresetsRow = ({
  value,
  onChange,
}: CadencePresetsRowProps) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Chip
        selected={value.preset == null}
        label="None"
        onPress={() => onChange({ preset: null, amount: null, unit: null })}
      />

      {PRESET_KEYS.map((key) => {
        const preset = CADENCE_PRESETS[key];
        return (
          <Chip
            key={key}
            selected={value.preset === key}
            label={preset.label}
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
        selected={value.preset === "custom"}
        label="Custom"
        onPress={() =>
          onChange({
            preset: "custom",
            amount: value.amount,
            unit: value.unit ?? "weeks",
          })
        }
      />
    </View>
  );
};
