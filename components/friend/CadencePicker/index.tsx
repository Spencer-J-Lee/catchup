import { Field } from "@/components/ui/Field";

import { CadenceCustomInput } from "./CadenceCustomInput";
import { CadencePresets } from "./CadencePresets";
import type { CadenceValue } from "./types";

export { DEFAULT_CADENCE_UNIT, type CadenceValue } from "./types";

interface CadencePickerProps {
  value: CadenceValue;
  onChange: (value: CadenceValue) => void;
}

export const CadencePicker = ({ value, onChange }: CadencePickerProps) => {
  return (
    <Field label="Catch-up cadence">
      <CadencePresets value={value} onChange={onChange} />

      {value.preset === "custom" ? (
        <CadenceCustomInput value={value} onChange={onChange} className="mt-1" />
      ) : null}
    </Field>
  );
};
