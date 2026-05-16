import { View } from "react-native";

import { Label } from "@/components/ui/Label";
import type { CadencePreset, CadenceUnit } from "@/types/database";

import { CadenceCustomInput } from "./CadenceCustomInput";
import { CadencePresets } from "./CadencePresets";

export interface CadenceValue {
  preset: CadencePreset | null;
  amount: number | null;
  unit: CadenceUnit | null;
}

export const DEFAULT_CADENCE_UNIT: CadenceUnit = "weeks";

interface CadencePickerProps {
  value: CadenceValue;
  onChange: (v: CadenceValue) => void;
}

export const CadencePicker = ({ value, onChange }: CadencePickerProps) => {
  return (
    <View className="gap-2">
      <Label>Catch-up cadence</Label>
      <CadencePresets value={value} onChange={onChange} />

      {value.preset === "custom" ? (
        <CadenceCustomInput value={value} onChange={onChange} className="mt-1" />
      ) : null}
    </View>
  );
};
