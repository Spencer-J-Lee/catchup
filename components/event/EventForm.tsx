import { View } from "react-native";

import { LocationPicker } from "@/components/event/LocationPicker";
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

export const eventFormToPayloadFields = (formValues: EventFormValues) => {
  const isInPerson = formValues.medium === "in_person";
  const hasMediumDetail =
    formValues.medium && !isInPerson && formValues.mediumDetail;

  return {
    event_at: formValues.date.toISOString(),
    medium: formValues.medium,
    medium_detail: hasMediumDetail ? formValues.mediumDetail : null,
    location_text: isInPerson ? formValues.locationText || null : null,
    location_address: isInPerson ? formValues.locationAddress || null : null,
    event_notes: formValues.notes || null,
  };
};

const STATUS_OPTIONS: EventStatus[] = ["scheduled", "completed", "cancelled"];

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
        <LocationPicker
          name={formValues.locationText}
          address={formValues.locationAddress}
          onChange={({ name, address }) =>
            onChange({
              ...formValues,
              locationText: name,
              locationAddress: address,
            })
          }
        />
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
