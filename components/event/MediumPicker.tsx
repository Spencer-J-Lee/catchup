import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { Field } from "@/components/ui/Field";
import type { Medium } from "@/types/database";

interface MediumPickerProps {
  value: Medium | null;
  onChange: (medium: Medium) => void;
}

const OPTIONS: { value: Medium; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "call", label: "Call" },
  { value: "video", label: "Video" },
  { value: "email", label: "Email" },
  { value: "in_person", label: "In person" },
];

export const MediumPicker = ({ value, onChange }: MediumPickerProps) => {
  return (
    <Field label="Medium">
      <ChipRow>
        {OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </ChipRow>
    </Field>
  );
};
