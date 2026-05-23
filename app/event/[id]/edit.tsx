import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import {
  EventForm,
  eventFormToPayloadFields,
  type EventFormValues,
} from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { eventInputSchema } from "@/lib/schemas";
import { toast, toastMutationError } from "@/lib/toast";

const EditEventScreen = () => {
  const router = useRouter();
  const colors = useThemedColors();
  const update = useUpdateEvent();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event } = useEvent(id);

  const [formValues, setFormValues] = useState<EventFormValues | null>(null);

  useEffect(() => {
    if (!event || formValues) return;

    setFormValues({
      date: new Date(event.event_at),
      status: event.status,
      medium: event.medium,
      mediumDetail: event.medium_detail ?? "",
      locationText: event.location_text ?? "",
      locationAddress: event.location_address ?? "",
      notes: event.event_notes ?? "",
    });
  }, [event, formValues]);

  if (!event || !formValues) {
    return (
      <Screen edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      </Screen>
    );
  }

  const onSave = async () => {
    if (!event || !formValues) return;

    const payload = {
      ...eventFormToPayloadFields(formValues),
      friend_id: event.friend_id,
      status: formValues.status,
    };

    const parsed = eventInputSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Invalid input", {
        description: parsed.error.issues[0]?.message ?? "",
      });
      return;
    }

    try {
      await update.mutateAsync({ ...parsed.data, id: event.id });
      toast.success("Saved");
      router.back();
    } catch (error) {
      toastMutationError(error, "Couldn't save catch-up");
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
      <EventForm mode="edit" formValues={formValues} onChange={setFormValues} />
    </Screen>
  );
};

export default EditEventScreen;
