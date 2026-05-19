// TODO: Review

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";

import {
  EventForm,
  type EventFormValues,
  type EventMode,
} from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";

const EditEventScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event } = useEvent(id);
  const update = useUpdateEvent();

  const [formValues, setFormValues] = useState<EventFormValues | null>(null);

  useEffect(() => {
    if (!event) return;
    const dateStr = event.scheduled_at ?? event.occurred_at;
    setFormValues({
      date: dateStr ? new Date(dateStr) : new Date(),
      status: event.status,
      medium: event.medium,
      mediumDetail: event.medium_detail ?? "",
      locationText: event.location_text ?? "",
      locationAddress: event.location_address ?? "",
      notes: event.event_notes ?? "",
    });
  }, [event]);

  if (!event || !formValues) {
    return (
      <Screen edges={[]}>
        <Text className="text-muted dark:text-muted-dk">Loading…</Text>
      </Screen>
    );
  }

  const mode: EventMode = "edit";

  const onSave = async () => {
    if (!event || !formValues) return;
    const isScheduled = formValues.status === "scheduled";
    try {
      await update.mutateAsync({
        id: event.id,
        status: formValues.status,
        scheduled_at: isScheduled
          ? formValues.date.toISOString()
          : (event.scheduled_at ?? null),
        occurred_at: isScheduled ? null : formValues.date.toISOString(),
        medium: formValues.medium,
        medium_detail:
          formValues.medium &&
          formValues.medium !== "in_person" &&
          formValues.mediumDetail
            ? formValues.mediumDetail
            : null,
        location_text: formValues.locationText || null,
        location_address: formValues.locationAddress || null,
        event_notes: formValues.notes || null,
        friend_id: event.friend_id,
      });
      router.back();
    } catch (error) {
      Alert.alert("Failed to save", (error as Error).message);
    }
  };

  return (
    <Screen
      scroll
      edges={[]}
      footer={
        <Button onPress={onSave} loading={update.isPending}>
          Save
        </Button>
      }
    >
      <EventForm
        mode={mode}
        formValues={formValues}
        onChange={setFormValues}
      />
    </Screen>
  );
};

export default EditEventScreen;
