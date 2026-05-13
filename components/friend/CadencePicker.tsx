import { Pressable, Text, TextInput, View } from "react-native";

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

const PRESET_KEYS: Array<Exclude<CadencePreset, "custom">> = [
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

export function CadencePicker({ value, onChange }: CadencePickerProps) {
  const customSelected = value.preset === "custom";
  const customAmountText =
    customSelected && value.amount != null ? String(value.amount) : "";
  const customUnit: CadenceUnit = customSelected && value.unit ? value.unit : "weeks";

  function setCustomAmount(text: string) {
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
  }

  function setCustomUnit(unit: CadenceUnit) {
    onChange({ preset: "custom", amount: value.amount, unit });
  }

  function selectCustom() {
    onChange({
      preset: "custom",
      amount: value.amount,
      unit: value.unit ?? "weeks",
    });
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-700">Catch-up cadence</Text>
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
                onChange({ preset: key, amount: preset.amount, unit: preset.unit })
              }
            />
          );
        })}
        <Chip selected={customSelected} label="Custom" onPress={selectCustom} />
      </View>
      {customSelected ? (
        <View className="gap-2 mt-1">
          <Text className="text-xs text-gray-500">Every</Text>
          <View className="flex-row items-center gap-2">
            <TextInput
              value={customAmountText}
              onChangeText={setCustomAmount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor="#9ca3af"
              className="border border-gray-300 rounded-xl px-3 py-2 text-base bg-white w-20 text-center"
            />
            <View className="flex-row gap-2">
              {UNITS.map((unit) => {
                const isOne = (value.amount ?? 0) === 1;
                const label = isOne ? UNIT_LABEL[unit].singular : UNIT_LABEL[unit].plural;
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
}

function Chip({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-full border ${
        selected ? "bg-brand-600 border-brand-600" : "bg-white border-gray-300"
      }`}
    >
      <Text className={selected ? "text-white" : "text-gray-900"}>{label}</Text>
    </Pressable>
  );
}
