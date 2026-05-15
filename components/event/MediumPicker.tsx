import classNames from "classnames";
import { Pressable, Text, View } from "react-native";

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

export function MediumPicker({ value, onChange }: MediumPickerProps) {
  return (
    <View className="gap-2">
      <Label>Medium</Label>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((o) => {
          const selected = value === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              className={classNames(
                "px-3 py-2 rounded-full",
                selected ? "bg-brand-300" : "bg-surface-elevated",
              )}
            >
              <Text
                className={selected ? "text-surface font-medium" : "text-fg"}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
