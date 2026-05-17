import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { FrequencyUnit } from "@/types/database";

import { DEFAULT_FREQUENCY_UNIT, type FrequencyValue } from "./types";

interface FrequencyCustomInputProps {
  value: FrequencyValue;
  onChange: (value: FrequencyValue) => void;
  className?: string;
}

const UNITS: FrequencyUnit[] = ["days", "weeks", "months"];

const UNIT_LABEL: Record<FrequencyUnit, { singular: string; plural: string }> =
  {
    days: { singular: "Day", plural: "Days" },
    weeks: { singular: "Week", plural: "Weeks" },
    months: { singular: "Month", plural: "Months" },
  };

export const FrequencyCustomInput = ({
  value,
  onChange,
  className,
}: FrequencyCustomInputProps) => {
  const amountStr = value.amount === null ? "" : String(value.amount);
  const selectedUnit: FrequencyUnit = value.unit ?? DEFAULT_FREQUENCY_UNIT;

  const setAmount = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const amount = parseInt(digits, 10);

    if (amount < 1 || !Number.isFinite(amount)) {
      onChange({ preset: "custom", amount: null, unit: selectedUnit });
      return;
    }

    onChange({ preset: "custom", amount, unit: selectedUnit });
  };

  const setUnit = (unit: FrequencyUnit) => {
    onChange({ preset: "custom", amount: value.amount, unit });
  };

  return (
    <Field label="Every" className={className}>
      <View className="flex-row items-center gap-2">
        <Input
          value={amountStr}
          onChangeText={setAmount}
          keyboardType="number-pad"
          placeholder="1"
          className="min-w-20 max-w-20 text-center"
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
                label={label}
                selected={selectedUnit === unit}
                onPress={() => setUnit(unit)}
              />
            );
          })}
        </View>
      </View>
    </Field>
  );
};
