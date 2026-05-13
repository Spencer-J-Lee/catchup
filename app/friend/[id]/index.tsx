import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import {
  useDeleteFriend,
  useFriend,
  useLinkFriendContact,
} from "@/hooks/use-friends";
import { useEventsForFriend } from "@/hooks/use-events";
import { formatDateTime, formatRelative } from "@/lib/format";
import {
  openCall,
  openContactCard,
  openMessage,
  pickContact,
  snapshotFrom,
} from "@/lib/contacts";
import type { CatchUpEvent, EventStatus } from "@/types/database";

export default function FriendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: friend, isLoading } = useFriend(id);
  const { data: events } = useEventsForFriend(id);
  const del = useDeleteFriend();
  const linkContact = useLinkFriendContact();

  if (isLoading || !friend) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  const lastCompleted = events?.find((e) => e.status === "completed" && e.occurred_at);

  function onDelete() {
    Alert.alert("Delete friend?", "This will also delete all catch-up history.", [
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

  const snapshot = snapshotFrom(friend.contact_snapshot);
  const phone = snapshot?.phone ?? null;
  const contactId = friend.contact_id;

  async function onLinkContact() {
    try {
      const picked = await pickContact();
      if (!picked) return;
      await linkContact.mutateAsync({
        id: id!,
        contact_id: picked.contact_id,
        contact_snapshot: picked.snapshot as unknown as Record<string, unknown>,
      });
    } catch (e) {
      Alert.alert("Couldn't link contact", (e as Error).message);
    }
  }

  function onMessage() {
    if (!phone) {
      Alert.alert("No phone number", "This contact has no phone number on file.");
      return;
    }
    openMessage(phone);
  }

  function onCall() {
    if (!phone) {
      Alert.alert("No phone number", "This contact has no phone number on file.");
      return;
    }
    openCall(phone);
  }

  function onContact() {
    if (!contactId) return;
    openContactCard(contactId);
  }

  return (
    <Screen scroll>
      <Stack.Screen
        options={{
          title: friend.display_name,
          headerRight: () => (
            <Link href={`/friend/${id}/edit`} asChild>
              <Pressable className="px-2">
                <Text className="text-brand-600 font-medium">Edit</Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <View className="gap-4">
        <View className="bg-white border border-gray-200 rounded-2xl p-4 gap-2">
          <Text className="text-sm text-gray-500">Last caught up</Text>
          <Text className="text-base text-gray-900">
            {lastCompleted?.occurred_at
              ? `${formatRelative(lastCompleted.occurred_at)} (${formatDateTime(lastCompleted.occurred_at)})`
              : "No catch-ups yet"}
          </Text>
          {friend.cadence_amount && friend.cadence_unit ? (
            <Text className="text-sm text-gray-500 mt-1">
              Cadence: every {friend.cadence_amount} {friend.cadence_unit}
            </Text>
          ) : (
            <Text className="text-sm text-gray-500 mt-1">No cadence set</Text>
          )}
        </View>

        {friend.general_notes ? (
          <View className="bg-white border border-gray-200 rounded-2xl p-4">
            <Text className="text-sm text-gray-500 mb-1">Notes</Text>
            <Text className="text-base text-gray-900">{friend.general_notes}</Text>
          </View>
        ) : null}

        {contactId ? (
          <View className="flex-row gap-2">
            <ContactActionButton
              icon="chatbubble-ellipses"
              label="Message"
              disabled={!phone}
              onPress={onMessage}
            />
            <ContactActionButton
              icon="call"
              label="Call"
              disabled={!phone}
              onPress={onCall}
            />
            <ContactActionButton
              icon="person-circle"
              label="Contact"
              onPress={onContact}
            />
          </View>
        ) : (
          <Pressable
            onPress={onLinkContact}
            disabled={linkContact.isPending}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3"
          >
            <Ionicons name="person-add" size={20} color="#2563eb" />
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {linkContact.isPending ? "Linking…" : "Link to phone contact"}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Enables Message, Call, and Contact actions.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Pressable>
        )}

        <View className="flex-row gap-2">
          <Link
            href={{ pathname: "/event/new", params: { friend_id: id, mode: "schedule" } }}
            asChild
          >
            <Pressable className="flex-1 bg-brand-600 active:bg-brand-700 rounded-xl px-4 py-3 items-center justify-center flex-row gap-2">
              <Ionicons name="calendar" size={18} color="white" />
              <Text className="text-white font-semibold">Schedule</Text>
            </Pressable>
          </Link>
          <Link
            href={{ pathname: "/event/new", params: { friend_id: id, mode: "checkin" } }}
            asChild
          >
            <Pressable className="flex-1 bg-gray-200 active:bg-gray-300 rounded-xl px-4 py-3 items-center justify-center flex-row gap-2">
              <Ionicons name="checkmark-circle" size={18} color="#111827" />
              <Text className="text-gray-900 font-semibold">Check in</Text>
            </Pressable>
          </Link>
        </View>

        {contactId ? (
          <Pressable
            onPress={onLinkContact}
            disabled={linkContact.isPending}
            className="self-center py-1 px-2"
            hitSlop={8}
          >
            <Text className="text-xs text-gray-500">
              {linkContact.isPending
                ? "Updating…"
                : `Linked${snapshot?.name ? ` to ${snapshot.name}` : ""} · change`}
            </Text>
          </Pressable>
        ) : null}

        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">History</Text>
          {!events || events.length === 0 ? (
            <Text className="text-gray-500">No events yet.</Text>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={events}
              keyExtractor={(e) => e.id}
              ItemSeparatorComponent={() => <View className="h-2" />}
              renderItem={({ item }) => <HistoryItem event={item} />}
            />
          )}
        </View>

        <Pressable
          onPress={onDelete}
          disabled={del.isPending}
          className="self-center py-2 px-3 mt-2"
          hitSlop={8}
        >
          <Text className="text-sm text-red-600 font-medium">
            {del.isPending ? "Deleting…" : "Delete friend"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function ContactActionButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 bg-white border border-gray-200 rounded-xl py-3 items-center justify-center gap-1 ${
        disabled ? "opacity-40" : "active:bg-gray-50"
      }`}
    >
      <Ionicons name={icon} size={22} color="#2563eb" />
      <Text className="text-xs font-medium text-gray-900">{label}</Text>
    </Pressable>
  );
}

const STATUS_META: Record<
  EventStatus,
  { label: string; pill: string; text: string }
> = {
  scheduled: {
    label: "Scheduled",
    pill: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
  completed: {
    label: "Completed",
    pill: "bg-green-50 border-green-200",
    text: "text-green-700",
  },
  missed: {
    label: "Missed",
    pill: "bg-red-50 border-red-200",
    text: "text-red-700",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-gray-100 border-gray-200",
    text: "text-gray-600",
  },
};

function HistoryItem({ event }: { event: CatchUpEvent }) {
  const meta = STATUS_META[event.status];
  const whenLabel = event.occurred_at
    ? formatDateTime(event.occurred_at)
    : event.scheduled_at
      ? formatDateTime(event.scheduled_at)
      : "";
  const mediumLabel = event.medium
    ? `${event.medium}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`
    : "—";

  return (
    <Link href={`/event/${event.id}`} asChild>
      <Pressable className="bg-white border border-gray-200 rounded-xl p-3 gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <View
            className={`px-2 py-0.5 rounded-full border ${meta.pill}`}
          >
            <Text className={`text-xs font-semibold ${meta.text}`}>{meta.label}</Text>
          </View>
          <Text className="text-xs text-gray-500">{whenLabel}</Text>
        </View>

        <Text className="text-sm font-medium text-gray-900">{mediumLabel}</Text>

        {event.event_notes ? (
          <Text className="text-sm text-gray-600" numberOfLines={3}>
            {event.event_notes}
          </Text>
        ) : null}
      </Pressable>
    </Link>
  );
}
