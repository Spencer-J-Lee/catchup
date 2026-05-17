import { Field } from "@/components/ui/Field";

import { FrequencyCustomInput } from "./FrequencyCustomInput";
import { FrequencyPresets } from "./FrequencyPresets";
import type { FrequencyValue } from "./types";

export { DEFAULT_FREQUENCY_UNIT, type FrequencyValue } from "./types";

interface FrequencyPickerProps {
  value: FrequencyValue;
  onChange: (value: FrequencyValue) => void;
}

export const FrequencyPicker = ({ value, onChange }: FrequencyPickerProps) => {
  return (
    <Field label="Catch-up frequency">
      <FrequencyPresets value={value} onChange={onChange} />

      {value.preset === "custom" ? (
        <FrequencyCustomInput
          value={value}
          onChange={onChange}
          className="mt-1"
        />
      ) : null}
    </Field>
  );
};
