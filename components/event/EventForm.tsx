import { View } from "react-native";

import { MediumPicker } from "@/components/event/MediumPicker";
import { Chip } from "@/components/ui/Chip";
import { ChipRow } from "@/components/ui/ChipRow";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { formatStatus } from "@/lib/format";
import type { EventStatus, Medium } from "@/types/database";

export type EventMode = "schedule" | "logCatchUp" | "edit";

export interface EventFormValues {
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
  email: "e.g. Gmail, Outlook",
};

interface EventFormProps {
  mode: EventMode;
  formValues: EventFormValues;
  onChange: (formValues: EventFormValues) => void;
}

export const EventForm = ({ mode, formValues, onChange }: EventFormProps) => {
  return (
    <View className="gap-4">
      {mode === "edit" ? (
        <Field label="Status">
          <ChipRow>
            {STATUS_OPTIONS.map((status) => (
              <Chip
                key={status}
                label={formatStatus(status)}
                selected={formValues.status === status}
                onPress={() => onChange({ ...formValues, status })}
              />
            ))}
          </ChipRow>
        </Field>
      ) : null}

      <DateTimeField
        label="When"
        value={formValues.date}
        onChange={(date) => onChange({ ...formValues, date })}
      />

      <MediumPicker
        value={formValues.medium}
        onChange={(medium) => onChange({ ...formValues, medium })}
      />

      {formValues.medium === "in_person" ? (
        <>
          <Input
            label="Location"
            placeholder="e.g. Joe's Pizza"
            value={formValues.locationText}
            onChangeText={(text) =>
              onChange({ ...formValues, locationText: text })
            }
          />
          <Input
            label="Address"
            placeholder="123 Main St, ..."
            value={formValues.locationAddress}
            onChangeText={(text) =>
              onChange({ ...formValues, locationAddress: text })
            }
          />
        </>
      ) : formValues.medium ? (
        <Input
          label="Detail"
          placeholder={MEDIUM_DETAIL_PLACEHOLDER[formValues.medium]}
          value={formValues.mediumDetail}
          onChangeText={(text) =>
            onChange({ ...formValues, mediumDetail: text })
          }
        />
      ) : null}

      <Input
        label="Notes"
        placeholder={
          mode === "schedule"
            ? "Anything to remember about this catch-up?"
            : "What came out of the conversation?"
        }
        value={formValues.notes}
        onChangeText={(text) => onChange({ ...formValues, notes: text })}
        multiline
        textAlignVertical="top"
        className="h-32"
      />
    </View>
  );
};
