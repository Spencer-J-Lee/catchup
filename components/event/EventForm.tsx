import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { MediumPicker } from "@/components/event/MediumPicker";
import { Input } from "@/components/ui/Input";
import { formatDateTime, formatStatus } from "@/lib/format";
import type { EventStatus, Medium } from "@/types/database";

export type EventMode = "schedule" | "checkin" | "edit";

export interface EventFormValue {
  date: Date;
  status: EventStatus;
  medium: Medium | null;
  mediumDetail: string;
  locationText: string;
  locationAddress: string;
  notes: string;
}

const STATUS_OPTIONS: EventStatus[] = [
  "scheduled",
  "completed",
  "missed",
  "cancelled",
];

const MEDIUM_DETAIL_PLACEHOLDER: Record<
  Exclude<Medium, "in_person">,
  string
> = {
  text: "e.g. iMessage, WhatsApp",
  call: "e.g. Phone, Discord",
  video: "e.g. Zoom, FaceTime",
};

interface Props {
  mode: EventMode;
  value: EventFormValue;
  onChange: (v: EventFormValue) => void;
}

export function EventForm({ mode, value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View className="gap-4">
      {mode === "edit" ? (
        <View className="gap-2">
          <Text className="text-sm font-medium text-fg-muted">Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => {
              const selected = value.status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => onChange({ ...value, status: s })}
                  className={`px-3 py-2 rounded-full ${
                    selected ? "bg-brand-300" : "bg-surface-elevated"
                  }`}
                >
                  <Text
                    className={
                      selected ? "text-surface font-medium" : "text-fg"
                    }
                  >
                    {formatStatus(s)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View className="gap-1">
        <Text className="text-sm font-medium text-fg-muted">When</Text>
        <Pressable
          onPress={() => setShowPicker(true)}
          className="border border-surface-border rounded-xl px-3 py-3 bg-surface-elevated"
        >
          <Text className="text-base text-fg">
            {formatDateTime(value.date)}
          </Text>
        </Pressable>
        {showPicker ? (
          <DateTimePicker
            value={value.date}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            themeVariant="dark"
            onChange={(_, d) => {
              setShowPicker(Platform.OS === "ios");
              if (d) onChange({ ...value, date: d });
            }}
          />
        ) : null}
      </View>

      <MediumPicker
        value={value.medium}
        onChange={(m) => onChange({ ...value, medium: m })}
      />

      {value.medium === "in_person" ? (
        <>
          <Input
            label="Location"
            placeholder="e.g. Joe's Pizza"
            value={value.locationText}
            onChangeText={(t) => onChange({ ...value, locationText: t })}
          />
          <Input
            label="Address"
            placeholder="123 Main St, ..."
            value={value.locationAddress}
            onChangeText={(t) => onChange({ ...value, locationAddress: t })}
          />
        </>
      ) : value.medium ? (
        <Input
          label="Detail"
          placeholder={MEDIUM_DETAIL_PLACEHOLDER[value.medium]}
          value={value.mediumDetail}
          onChangeText={(t) => onChange({ ...value, mediumDetail: t })}
        />
      ) : null}

      <Input
        label="Notes"
        placeholder={
          mode === "schedule"
            ? "Anything to remember about this catch-up?"
            : "What came out of the conversation?"
        }
        value={value.notes}
        onChangeText={(t) => onChange({ ...value, notes: t })}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="h-24"
      />
    </View>
  );
}
