import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

import {
  EventForm,
  type EventFormValues,
  type EventMode,
} from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";
import { useThemedColors } from "@/hooks/use-themed-colors";

const EditEventScreen = () => {
  const router = useRouter();
  const colors = useThemedColors();
  const update = useUpdateEvent();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event } = useEvent(id);

  const [formValues, setFormValues] = useState<EventFormValues | null>(null);

  useEffect(() => {
    if (!event) return;

    setFormValues({
      date: new Date(event.event_at),
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      </Screen>
    );
  }

  const mode: EventMode = "edit";

  const onSave = async () => {
    if (!event || !formValues) return;

    const hasMediumDetail =
      formValues.medium &&
      formValues.medium !== "in_person" &&
      formValues.mediumDetail;

    const payload: Parameters<typeof update.mutateAsync>[0] = {
      id: event.id,
      friend_id: event.friend_id,
      status: formValues.status,
      event_at: formValues.date.toISOString(),
      medium: formValues.medium,
      medium_detail: hasMediumDetail ? formValues.mediumDetail : null,
      location_text: formValues.locationText || null,
      location_address: formValues.locationAddress || null,
      event_notes: formValues.notes || null,
    };

    try {
      await update.mutateAsync(payload);
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
      <EventForm mode={mode} formValues={formValues} onChange={setFormValues} />
    </Screen>
  );
};

export default EditEventScreen;
