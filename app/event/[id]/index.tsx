// TODO: Review

import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Linking, Platform, Pressable, Text, View } from "react-native";

import { EventDetailSkeleton } from "@/components/event/EventDetailSkeleton";
import { Button } from "@/components/ui/Button";
import { DividedList } from "@/components/ui/DividedList";
import { PressableRow } from "@/components/ui/PressableRow";
import { Row } from "@/components/ui/Row";
import { Screen } from "@/components/ui/Screen";
import { Surface } from "@/components/ui/Surface";
import { useDeleteEvent, useEvent, useUpdateEvent } from "@/hooks/use-events";
import { useFormatters } from "@/hooks/use-formatters";
import { formatMedium, formatStatus } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { toast, toastMutationError } from "@/lib/toast";

const EventDetailScreen = () => {
  const router = useRouter();
  const update = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);
  const { formatDateTime } = useFormatters();

  if (isLoading || !event) {
    return (
      <Screen scroll edges={[]}>
        <EventDetailSkeleton />
      </Screen>
    );
  }

  const onMarkComplete = async () => {
    if (!event) return;

    try {
      await update.mutateAsync({
        id: event.id,
        status: "completed",
        friend_id: event.friend_id,
      });
      toast.success("Marked complete");
    } catch (error) {
      toastMutationError(error, "Couldn't update catch-up");
    }
  };

  const onMarkMissed = async () => {
    if (!event) return;

    try {
      await update.mutateAsync({
        id: event.id,
        status: "missed",
        friend_id: event.friend_id,
      });
      toast.success("Marked missed");
    } catch (error) {
      toastMutationError(error, "Couldn't update catch-up");
    }
  };

  const onMarkCancelled = async () => {
    if (!event) return;

    try {
      await update.mutateAsync({
        id: event.id,
        status: "cancelled",
        friend_id: event.friend_id,
      });
      toast.success("Marked cancelled");
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

  const openMaps = () => {
    if (!event?.location_address) return;
    const query = encodeURIComponent(event.location_address);
    const url =
      Platform.OS === "ios" ? `maps://?q=${query}` : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${query}`),
    );
  };

  return (
    <Screen scroll edges={[]}>
      <Stack.Screen
        options={{
          title: "Catch-up",
          headerRight: () => (
            <Link href={ROUTES.event.edit(id)} asChild>
              <Pressable className="p-2" hitSlop={16}>
                <Text className="text-brand dark:text-brand-dk font-medium">
                  Edit
                </Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <View className="gap-4">
        <Surface>
          <DividedList>
            <Row label="Status" value={formatStatus(event.status)} />

            <Row
              label={event.status === "scheduled" ? "Scheduled" : "When"}
              value={formatDateTime(event.event_at)}
            />

            {event.medium ? (
              <Row
                label="Medium"
                value={`${formatMedium(event.medium)}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`}
              />
            ) : null}

            {event.location_address ? (
              <PressableRow
                label="Location"
                value={event.location_text || event.location_address}
                onPress={openMaps}
                textStyle="link"
              />
            ) : event.location_text ? (
              <Row label="Location" value={event.location_text} />
            ) : null}
          </DividedList>
        </Surface>

        {event.event_notes ? (
          <Surface>
            <Text className="text-sm text-muted dark:text-muted-dk mb-1">
              Notes
            </Text>
            <Text className="text-base text-default dark:text-default-dk">
              {event.event_notes}
            </Text>
          </Surface>
        ) : null}

        {event.status === "scheduled" ? (
          <View className="gap-2">
            <Button onPress={onMarkComplete} loading={update.isPending}>
              Mark as completed
            </Button>
            <Button
              variant="secondary"
              onPress={onMarkMissed}
              loading={update.isPending}
            >
              Mark as missed
            </Button>
            <Button
              variant="secondary"
              onPress={onMarkCancelled}
              loading={update.isPending}
            >
              Mark as cancelled
            </Button>
          </View>
        ) : null}

        <Pressable
          onPress={onDelete}
          disabled={deleteEvent.isPending}
          className="self-center py-2 px-3 mt-2"
          hitSlop={8}
        >
          <Text className="text-sm text-danger dark:text-danger-dk font-medium">
            {deleteEvent.isPending ? "Deleting…" : "Delete"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
};

export default EventDetailScreen;
