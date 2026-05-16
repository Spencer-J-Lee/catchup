import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import type { CadenceUnit } from "@/types/database";

import { Label } from "../ui/Label";
import type { CadenceValue } from "./CadencePicker";

interface CadenceCustomInputProps {
  value: CadenceValue;
  onChange: (v: CadenceValue) => void;
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
}: CadenceCustomInputProps) => {
  const amountText = value.amount === null ? "" : String(value.amount);
  const unit: CadenceUnit = value.unit ?? "weeks";

  const setAmount = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const amount = parseInt(digits, 10);

    if (!Number.isFinite(amount) || amount < 1) {
      onChange({ preset: "custom", amount: null, unit });
      return;
    }

    onChange({ preset: "custom", amount, unit });
  };

  const setUnit = (u: CadenceUnit) => {
    onChange({ preset: "custom", amount: value.amount, unit: u });
  };

  return (
    <View className="gap-2 mt-1">
      <Label>Every</Label>

      <View className="flex-row items-center gap-2">
        <Input
          value={amountText}
          onChangeText={setAmount}
          keyboardType="number-pad"
          placeholder="1"
          className="w-20 text-center"
        />

        <View className="flex-row gap-2">
          {UNITS.map((u) => {
            const isOne = (value.amount ?? 0) === 1;
            const label = isOne ? UNIT_LABEL[u].singular : UNIT_LABEL[u].plural;

            return (
              <Chip
                key={u}
                selected={unit === u}
                label={label}
                onPress={() => setUnit(u)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};
