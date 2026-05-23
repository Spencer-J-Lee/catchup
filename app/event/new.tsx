import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";

import {
  EventForm,
  eventFormToPayloadFields,
  type EventFormValues,
  type EventMode,
} from "@/components/event/EventForm";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useCreateEvent } from "@/hooks/use-events";
import { useProfile } from "@/hooks/use-profile";
import { eventInputSchema } from "@/lib/schemas";
import { toast, toastMutationError } from "@/lib/toast";

type NewEventMode = Exclude<EventMode, "edit">;

interface ModeConfig {
  title: string;
  status: "scheduled" | "completed";
  buttonLabel: string;
  successMessage: string;
  initialDate: () => Date;
  usesPreReminder: boolean;
}

const MODE_CONFIG = {
  schedule: {
    title: "Schedule catch-up",
    status: "scheduled",
    buttonLabel: "Schedule",
    successMessage: "Catch-up scheduled",
    initialDate: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    usesPreReminder: true,
  },
  logCatchUp: {
    title: "Log catch-up",
    status: "completed",
    buttonLabel: "Log catch-up",
    successMessage: "Catch-up logged",
    initialDate: () => new Date(),
    usesPreReminder: false,
  },
} satisfies Record<NewEventMode, ModeConfig>;

const NewEventScreen = () => {
  const params = useLocalSearchParams<{ friend_id: string; mode?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const create = useCreateEvent();

  const mode: NewEventMode =
    params.mode === "logCatchUp" ? "logCatchUp" : "schedule";
  const config = MODE_CONFIG[mode];

  const initialFormValues = useMemo<EventFormValues>(
    () => ({
      date: config.initialDate(),
      status: config.status,
      medium: null,
      mediumDetail: "",
      locationText: "",
      locationAddress: "",
      notes: "",
    }),
    [config],
  );

  const [formValues, setFormValues] =
    useState<EventFormValues>(initialFormValues);

  const onSave = async () => {
    if (!user) return;

    const defaultPreReminder = profile?.default_pre_reminder_minutes ?? 0;
    const payload = {
      ...eventFormToPayloadFields(formValues),
      friend_id: params.friend_id,
      status: config.status,
      pre_reminder_minutes:
        config.usesPreReminder && defaultPreReminder > 0
          ? defaultPreReminder
          : null,
    };

    const parsed = eventInputSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Invalid input", {
        description: parsed.error.issues[0]?.message ?? "",
      });
      return;
    }

    try {
      await create.mutateAsync({ ...parsed.data, user_id: user.id });
      toast.success(config.successMessage);
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
        <Button onPress={onSave} loading={create.isPending}>
          {config.buttonLabel}
        </Button>
      }
    >
      <Stack.Screen options={{ title: config.title }} />
      <EventForm mode={mode} formValues={formValues} onChange={setFormValues} />
    </Screen>
  );
};

export default NewEventScreen;
