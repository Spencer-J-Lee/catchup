import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { EventForm, type EventFormValue, type EventMode } from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useCreateEvent } from "@/hooks/use-events";
import { eventInputSchema } from "@/lib/schemas";

export default function NewEventScreen() {
  const params = useLocalSearchParams<{ friend_id?: string; mode?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateEvent();

  const mode: EventMode = params.mode === "checkin" ? "checkin" : "schedule";
  const title = mode === "schedule" ? "Schedule catch-up" : "Check-in";

  const initialValue = useMemo<EventFormValue>(() => {
    const now = new Date();
    return {
      date:
        mode === "schedule"
          ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
          : now,
      medium: null,
      locationText: "",
      locationAddress: "",
      notes: "",
    };
  }, [mode]);

  const [value, setValue] = useState<EventFormValue>(initialValue);

  async function onSave() {
    if (!user || !params.friend_id) return;
    const isScheduled = mode === "schedule";
    const status = isScheduled ? "scheduled" : "completed";
    const payload = {
      friend_id: params.friend_id,
      scheduled_at: isScheduled ? value.date.toISOString() : null,
      occurred_at: !isScheduled ? value.date.toISOString() : null,
      status: status as "scheduled" | "completed",
      medium: value.medium,
      medium_detail: null,
      location_text: value.locationText || null,
      location_address: value.locationAddress || null,
      event_notes: value.notes || null,
    };
    const parsed = eventInputSchema.safeParse(payload);
    if (!parsed.success) {
      Alert.alert("Invalid input", parsed.error.issues[0]?.message ?? "");
      return;
    }
    try {
      await create.mutateAsync({ ...parsed.data, user_id: user.id });
      router.back();
    } catch (e) {
      Alert.alert("Failed to save", (e as Error).message);
    }
  }

  if (!params.friend_id) {
    return (
      <Screen>
        <Text className="text-red-600">Missing friend_id</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title }} />
      <View className="gap-4">
        <EventForm mode={mode} value={value} onChange={setValue} />

        <Button onPress={onSave} loading={create.isPending}>
          {mode === "schedule" ? "Schedule" : "Save check-in"}
        </Button>
      </View>
    </Screen>
  );
}
