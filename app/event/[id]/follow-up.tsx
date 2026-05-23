import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { NotesStep } from "@/components/event/FollowUp/NotesStep";
import { StatusPicker } from "@/components/event/FollowUp/StatusPicker";
import {
  STATUS_OPTIONS_BY_STATUS,
  type FollowUpStatus,
} from "@/components/event/FollowUp/statusOptions";
import { Screen } from "@/components/ui/Screen";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { toast, toastMutationError } from "@/lib/toast";

const FollowUpScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemedColors();
  const { data: event, isLoading } = useEvent(id);
  const update = useUpdateEvent();

  const [selectedStatus, setSelectedStatus] = useState<FollowUpStatus | null>(
    null,
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (event) setNotes(event.event_notes ?? "");
  }, [event]);

  if (isLoading || !event) {
    return (
      <Screen edges={["bottom"]}>
        <View className="items-center justify-center py-8">
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      </Screen>
    );
  }

  const submit = async (notesToSave: string | undefined) => {
    if (!selectedStatus) return;

    const payload: Parameters<typeof update.mutateAsync>[0] = {
      id: event.id,
      friend_id: event.friend_id,
      status: selectedStatus,
    };

    if (notesToSave) {
      payload.event_notes = notesToSave.trim() || null;
    }

    try {
      await update.mutateAsync(payload);
      toast.success("Follow-up saved");
      router.back();
    } catch (error) {
      toastMutationError(error, "Couldn't save follow-up");
    }
  };

  if (!selectedStatus) {
    return <StatusPicker onSelect={setSelectedStatus} />;
  } else {
    return (
      <NotesStep
        selectedOption={STATUS_OPTIONS_BY_STATUS[selectedStatus]}
        notes={notes}
        onChangeStatus={() => setSelectedStatus(null)}
        onNotesChange={setNotes}
        onSave={() => submit(notes)}
        onSkip={() => submit(undefined)}
        isSubmitting={update.isPending}
      />
    );
  }
};

export default FollowUpScreen;
