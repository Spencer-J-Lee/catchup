import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import {
  EventForm,
  type EventFormValues,
  type EventMode,
} from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useCreateEvent } from "@/hooks/use-events";
import { eventInputSchema } from "@/lib/schemas";

const NewEventScreen = () => {
  const params = useLocalSearchParams<{ friend_id?: string; mode?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateEvent();

  const mode: EventMode = params.mode === "checkin" ? "checkin" : "schedule";
  const title = mode === "schedule" ? "Schedule catch-up" : "Check-in";

  const initialFormValues = useMemo<EventFormValues>(() => {
    const now = new Date();
    return {
      date:
        mode === "schedule"
          ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
          : now,
      status: mode === "schedule" ? "scheduled" : "completed",
      medium: null,
      mediumDetail: "",
      locationText: "",
      locationAddress: "",
      notes: "",
    };
  }, [mode]);

  const [formValues, setFormValues] =
    useState<EventFormValues>(initialFormValues);

  const onSave = async () => {
    if (!user || !params.friend_id) return;
    const isScheduled = mode === "schedule";
    const status = isScheduled ? "scheduled" : "completed";
    const payload = {
      friend_id: params.friend_id,
      scheduled_at: isScheduled ? formValues.date.toISOString() : null,
      occurred_at: !isScheduled ? formValues.date.toISOString() : null,
      status: status as "scheduled" | "completed",
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
    };
    const parsed = eventInputSchema.safeParse(payload);
    if (!parsed.success) {
      Alert.alert("Invalid input", parsed.error.issues[0]?.message ?? "");
      return;
    }
    try {
      await create.mutateAsync({ ...parsed.data, user_id: user.id });
      router.back();
    } catch (error) {
      Alert.alert("Failed to save", (error as Error).message);
    }
  };

  if (!params.friend_id) {
    return (
      <Screen>
        <Text className="text-danger-400">Missing friend_id</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title }} />
      <View className="gap-4">
        <EventForm
          mode={mode}
          formValues={formValues}
          onChange={setFormValues}
        />

        <Button onPress={onSave} loading={create.isPending}>
          {mode === "schedule" ? "Schedule" : "Save check-in"}
        </Button>
      </View>
    </Screen>
  );
};

export default NewEventScreen;
