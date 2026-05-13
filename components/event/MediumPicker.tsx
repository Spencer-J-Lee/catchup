import { Pressable, Text, View } from "react-native";

import type { Medium } from "@/types/database";

interface Props {
  value: Medium | null;
  onChange: (v: Medium) => void;
}

const OPTIONS: Array<{ value: Medium; label: string }> = [
  { value: "text", label: "Text" },
  { value: "call", label: "Call" },
  { value: "video", label: "Video" },
  { value: "in_person", label: "In person" },
];

export function MediumPicker({ value, onChange }: Props) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-700">Medium</Text>
      <View className="flex-row flex-wrap gap-2">
        {OPTIONS.map((o) => {
          const selected = value === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              className={`px-3 py-2 rounded-full border ${
                selected ? "bg-brand-600 border-brand-600" : "bg-white border-gray-300"
              }`}
            >
              <Text className={selected ? "text-white" : "text-gray-900"}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
