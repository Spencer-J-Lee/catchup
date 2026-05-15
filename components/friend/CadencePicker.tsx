import { Text, TextInput, View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import { CADENCE_PRESETS } from "@/lib/cadence";
import type { CadencePreset, CadenceUnit } from "@/types/database";

interface Value {
  preset: CadencePreset | null;
  amount: number | null;
  unit: CadenceUnit | null;
}

interface CadencePickerProps {
  value: Value;
  onChange: (v: Value) => void;
}

const PRESET_KEYS: Exclude<CadencePreset, "custom">[] = [
  "daily",
  "weekly",
  "monthly",
  "3_months",
  "6_months",
  "yearly",
];

const UNITS: CadenceUnit[] = ["days", "weeks", "months"];

const UNIT_LABEL: Record<CadenceUnit, { singular: string; plural: string }> = {
  days: { singular: "Day", plural: "Days" },
  weeks: { singular: "Week", plural: "Weeks" },
  months: { singular: "Month", plural: "Months" },
};

export const CadencePicker = ({ value, onChange }: CadencePickerProps) => {
  const customSelected = value.preset === "custom";
  const customAmountText =
    customSelected && value.amount != null ? String(value.amount) : "";
  const customUnit: CadenceUnit =
    customSelected && value.unit ? value.unit : "weeks";

  const setCustomAmount = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (digits === "") {
      onChange({ preset: "custom", amount: null, unit: customUnit });
      return;
    }
    const amount = parseInt(digits, 10);
    if (!Number.isFinite(amount) || amount < 1) {
      onChange({ preset: "custom", amount: null, unit: customUnit });
      return;
    }
    onChange({ preset: "custom", amount, unit: customUnit });
  };

  const setCustomUnit = (unit: CadenceUnit) => {
    onChange({ preset: "custom", amount: value.amount, unit });
  };

  const selectCustom = () => {
    onChange({
      preset: "custom",
      amount: value.amount,
      unit: value.unit ?? "weeks",
    });
  };

  return (
    <View className="gap-2">
      <Label>Catch-up cadence</Label>
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
        <Chip selected={customSelected} label="Custom" onPress={selectCustom} />
      </View>
      {customSelected ? (
        <View className="gap-2 mt-1">
          <Text className="text-xs text-fg-muted">Every</Text>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={customAmountText}
              onChangeText={setCustomAmount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor="#6e6e73"
              className="border border-surface-border rounded-xl px-3 py-2 text-base bg-surface-elevated text-fg w-20 text-center"
            />
            <View className="flex-row gap-2">
              {UNITS.map((unit) => {
                const isOne = (value.amount ?? 0) === 1;
                const label = isOne
                  ? UNIT_LABEL[unit].singular
                  : UNIT_LABEL[unit].plural;
                return (
                  <Chip
                    key={unit}
                    selected={customUnit === unit}
                    label={label}
                    onPress={() => setCustomUnit(unit)}
                  />
                );
              })}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

