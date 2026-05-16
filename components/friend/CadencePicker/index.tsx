import { View } from "react-native";

import { Label } from "@/components/ui/Label";

import { CadenceCustomInput } from "./CadenceCustomInput";
import { CadencePresets } from "./CadencePresets";
import type { CadenceValue } from "./types";

export { DEFAULT_CADENCE_UNIT, type CadenceValue } from "./types";

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
