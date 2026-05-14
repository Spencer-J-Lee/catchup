import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { EventForm, type EventFormValue, type EventMode } from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event } = useEvent(id);
  const update = useUpdateEvent();

  const [value, setValue] = useState<EventFormValue | null>(null);

  useEffect(() => {
    if (!event) return;
    const dateStr = event.scheduled_at ?? event.occurred_at;
    setValue({
      date: dateStr ? new Date(dateStr) : new Date(),
      medium: event.medium,
      mediumDetail: event.medium_detail ?? "",
      locationText: event.location_text ?? "",
      locationAddress: event.location_address ?? "",
      notes: event.event_notes ?? "",
    });
  }, [event]);

  if (!event || !value) {
    return (
      <Screen>
        <Text className="text-fg-muted">Loading…</Text>
      </Screen>
    );
  }

  const mode: EventMode = event.scheduled_at && event.status === "scheduled" ? "schedule" : "edit";

  async function onSave() {
    if (!event || !value) return;
    const isScheduled = !!event.scheduled_at && event.status === "scheduled";
    try {
      await update.mutateAsync({
        id: event.id,
        scheduled_at: isScheduled ? value.date.toISOString() : event.scheduled_at ?? null,
        occurred_at: !isScheduled ? value.date.toISOString() : event.occurred_at ?? null,
        medium: value.medium,
        medium_detail:
          value.medium && value.medium !== "in_person" && value.mediumDetail
            ? value.mediumDetail
            : null,
        location_text: value.locationText || null,
        location_address: value.locationAddress || null,
        event_notes: value.notes || null,
        friend_id: event.friend_id,
      });
      router.back();
    } catch (e) {
      Alert.alert("Failed to save", (e as Error).message);
    }
  }

  return (
    <Screen scroll>
      <View className="gap-4">
        <EventForm mode={mode} value={value} onChange={setValue} />
        <Button onPress={onSave} loading={update.isPending}>
          Save
        </Button>
      </View>
    </Screen>
  );
}
