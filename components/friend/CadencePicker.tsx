import { View } from "react-native";

import { Label } from "@/components/ui/Label";
import type { CadencePreset, CadenceUnit } from "@/types/database";

import { CadenceCustomInput } from "./CadenceCustomInput";
import { CadencePresetsRow } from "./CadencePresetsRow";

export interface CadenceValue {
  preset: CadencePreset | null;
  amount: number | null;
  unit: CadenceUnit | null;
}

interface CadencePickerProps {
  value: CadenceValue;
  onChange: (v: CadenceValue) => void;
}

export const CadencePicker = ({ value, onChange }: CadencePickerProps) => {
  return (
    <View className="gap-2">
      <Label>Catch-up cadence</Label>
      <CadencePresetsRow value={value} onChange={onChange} />

      {value.preset === "custom" ? (
        <CadenceCustomInput value={value} onChange={onChange} />
      ) : null}
    </View>
  );
};
