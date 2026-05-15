import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import type { Medium } from "@/types/database";

interface MediumPickerProps {
  value: Medium | null;
  onChange: (v: Medium) => void;
}

const OPTIONS: { value: Medium; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "call", label: "Call" },
  { value: "video", label: "Video" },
  { value: "in_person", label: "In person" },
];

export const MediumPicker = ({ value, onChange }: MediumPickerProps) => {
  return (
    <View className="gap-2">
      <Label>Medium</Label>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <Chip
            key={o.value}
            selected={value === o.value}
            label={o.label}
            onPress={() => onChange(o.value)}
          />
        ))}
      </View>
    </View>
  );
};
