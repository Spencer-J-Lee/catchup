import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { MediumPicker } from "@/components/event/MediumPicker";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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

interface EventFormProps {
  mode: EventMode;
  value: EventFormValue;
  onChange: (value: EventFormValue) => void;
}

export const EventForm = ({ mode, value, onChange }: EventFormProps) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View className="gap-4">
      {mode === "edit" ? (
        <View className="gap-2">
          <Label>Status</Label>
          <View className="flex-row flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <Chip
                key={status}
                label={formatStatus(status)}
                selected={value.status === status}
                onPress={() => onChange({ ...value, status })}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-1">
        <Label>When</Label>
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
            onChange={(_, date) => {
              setShowPicker(Platform.OS === "ios");
              if (date) onChange({ ...value, date });
            }}
          />
        ) : null}
      </View>

      <MediumPicker
        value={value.medium}
        onChange={(medium) => onChange({ ...value, medium })}
      />

      {value.medium === "in_person" ? (
        <>
          <Input
            label="Location"
            placeholder="e.g. Joe's Pizza"
            value={value.locationText}
            onChangeText={(text) => onChange({ ...value, locationText: text })}
          />
          <Input
            label="Address"
            placeholder="123 Main St, ..."
            value={value.locationAddress}
            onChangeText={(text) =>
              onChange({ ...value, locationAddress: text })
            }
          />
        </>
      ) : value.medium ? (
        <Input
          label="Detail"
          placeholder={MEDIUM_DETAIL_PLACEHOLDER[value.medium]}
          value={value.mediumDetail}
          onChangeText={(text) => onChange({ ...value, mediumDetail: text })}
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
        onChangeText={(text) => onChange({ ...value, notes: text })}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="h-24"
      />
    </View>
  );
};
