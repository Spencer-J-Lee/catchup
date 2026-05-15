import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Row } from "@/components/ui/Row";
import { Screen } from "@/components/ui/Screen";
import { useDeleteEvent, useEvent, useUpdateEvent } from "@/hooks/use-events";
import { formatDateTime, formatMedium, formatStatus } from "@/lib/format";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event, isLoading } = useEvent(id);
  const update = useUpdateEvent();
  const del = useDeleteEvent();

  if (isLoading || !event) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      </Screen>
    );
  }

  async function onMarkComplete() {
    if (!event) return;
    try {
      await update.mutateAsync({
        id: event.id,
        status: "completed",
        occurred_at: new Date().toISOString(),
        friend_id: event.friend_id,
      });
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
    }
  }

  async function onMarkMissed() {
    if (!event) return;
    try {
      await update.mutateAsync({
        id: event.id,
        status: "missed",
        friend_id: event.friend_id,
      });
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
    }
  }

  async function onMarkCancelled() {
    if (!event) return;
    try {
      await update.mutateAsync({
        id: event.id,
        status: "cancelled",
        friend_id: event.friend_id,
      });
    } catch (e) {
      Alert.alert("Failed", (e as Error).message);
    }
  }

  function onDelete() {
    Alert.alert("Delete event?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await del.mutateAsync(id!);
          router.back();
        },
      },
    ]);
  }

  function openMaps() {
    if (!event?.location_address) return;
    const q = encodeURIComponent(event.location_address);
    const url = Platform.OS === "ios" ? `maps://?q=${q}` : `geo:0,0?q=${q}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${q}`),
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: "Catch-up",
          headerRight: () => (
            <Link href={`/event/${id}/edit`} asChild>
              <Pressable className="px-2">
                <Text className="text-brand-300 font-medium">Edit</Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <View className="gap-4">
        <View className="bg-surface-elevated rounded-2xl p-4 gap-2">
          <Row label="Status" value={formatStatus(event.status)} />
          {event.scheduled_at ? (
            <Row label="Scheduled" value={formatDateTime(event.scheduled_at)} />
          ) : null}
          {event.occurred_at ? (
            <Row label="Occurred" value={formatDateTime(event.occurred_at)} />
          ) : null}
          {event.medium ? (
            <Row
              label="Medium"
              value={`${formatMedium(event.medium)}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`}
            />
          ) : null}
          {event.location_text || event.location_address ? (
            <View>
              <Text className="text-sm text-fg-muted">Location</Text>
              <Text className="text-base text-fg">{event.location_text}</Text>
              {event.location_address ? (
                <Pressable onPress={openMaps}>
                  <Text className="text-base text-brand-300 underline">
                    {event.location_address}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {event.event_notes ? (
          <View className="bg-surface-elevated rounded-2xl p-4">
            <Text className="text-sm text-fg-muted mb-1">Notes</Text>
            <Text className="text-base text-fg">{event.event_notes}</Text>
          </View>
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
          disabled={del.isPending}
          className="self-center py-2 px-3 mt-2"
          hitSlop={8}
        >
          <Text className="text-sm text-danger-400 font-medium">
            {del.isPending ? "Deleting…" : "Delete"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

