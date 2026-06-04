import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { EventDetailsCard } from "@/components/event/Detail/EventDetailsCard";
import {
  EventStatusActions,
  type MarkableStatus,
} from "@/components/event/Detail/EventStatusActions";
import { EventDetailSkeleton } from "@/components/event/EventDetailSkeleton";
import { Screen } from "@/components/ui/Screen";
import { Surface } from "@/components/ui/Surface";
import { useDeleteEvent, useEvent, useUpdateEvent } from "@/hooks/use-events";
import { ROUTES } from "@/lib/routes";
import { toast, toastMutationError } from "@/lib/toast";

const TOAST_LABEL_BY_STATUS: Record<MarkableStatus, string> = {
  completed: "Marked complete",
  cancelled: "Marked cancelled",
};

const EventDetailScreen = () => {
  const router = useRouter();
  const update = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);

  if (isLoading || !event) {
    return (
      <Screen scroll edges={[]}>
        <EventDetailSkeleton />
      </Screen>
    );
  }

  const markAs = async (status: MarkableStatus) => {
    try {
      await update.mutateAsync({
        id: event.id,
        status,
        friend_id: event.friend_id,
      });
      toast.success(TOAST_LABEL_BY_STATUS[status]);
    } catch (error) {
      toastMutationError(error, "Couldn't update catch-up");
    }
  };

  const onDelete = () => {
    Alert.alert("Delete event?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEvent.mutateAsync(id!);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen scroll edges={[]}>
      <Stack.Screen
        options={{
          title: "Catch-up",
          headerRight: () => (
            <Link href={ROUTES.event.edit(id)} asChild>
              <Pressable className="p-2" hitSlop={16}>
                <Text className="font-medium text-brand dark:text-brand-dk">
                  Edit
                </Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <View className="gap-4">
        <EventDetailsCard event={event} />

        {event.event_notes ? (
          <Surface>
            <Text className="mb-1 text-sm text-muted dark:text-muted-dk">
              Notes
            </Text>
            <Text className="text-base text-default dark:text-default-dk">
              {event.event_notes}
            </Text>
          </Surface>
        ) : null}

        {/* TODO: Improve */}
        {event.status === "scheduled" ? (
          <EventStatusActions
            onMark={markAs}
            onReschedule={() => router.push(ROUTES.event.edit(id))}
            isPending={update.isPending}
          />
        ) : null}

        {/* TODO: Improve */}
        <Pressable
          onPress={onDelete}
          disabled={deleteEvent.isPending}
          className="mt-2 self-center px-3 py-2"
          hitSlop={8}
        >
          <Text className="text-sm font-medium text-danger dark:text-danger-dk">
            {deleteEvent.isPending ? "Deleting…" : "Delete"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
};

export default EventDetailScreen;
