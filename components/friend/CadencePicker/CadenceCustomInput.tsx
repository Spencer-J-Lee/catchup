import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { CadenceUnit } from "@/types/database";

import { DEFAULT_CADENCE_UNIT, type CadenceValue } from "./types";

interface CadenceCustomInputProps {
  value: CadenceValue;
  onChange: (value: CadenceValue) => void;
  className?: string;
}

const UNITS: CadenceUnit[] = ["days", "weeks", "months"];

const UNIT_LABEL: Record<CadenceUnit, { singular: string; plural: string }> = {
  days: { singular: "Day", plural: "Days" },
  weeks: { singular: "Week", plural: "Weeks" },
  months: { singular: "Month", plural: "Months" },
};

export const CadenceCustomInput = ({
  value,
  onChange,
  className,
}: CadenceCustomInputProps) => {
  const amountStr = value.amount === null ? "" : String(value.amount);
  const selectedUnit: CadenceUnit = value.unit ?? DEFAULT_CADENCE_UNIT;

  const setAmount = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const amount = parseInt(digits, 10);

    if (amount < 1 || !Number.isFinite(amount)) {
      onChange({ preset: "custom", amount: null, unit: selectedUnit });
      return;
    }

    onChange({ preset: "custom", amount, unit: selectedUnit });
  };

  const setUnit = (unit: CadenceUnit) => {
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
