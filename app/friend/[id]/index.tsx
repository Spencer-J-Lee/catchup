import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { format, isThisYear } from "date-fns";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { FriendAvatar } from "@/components/friend/FriendListItem/FriendAvatar";
import { PressableRow } from "@/components/ui/PressableRow";
import { Row } from "@/components/ui/Row";
import { Screen } from "@/components/ui/Screen";
import { useEventsForFriend } from "@/hooks/use-events";
import {
  useDeleteFriend,
  useFriend,
  useLinkFriendContact,
} from "@/hooks/use-friends";
import { colors } from "@/lib/colors";
import {
  openCall,
  openContactCard,
  openEmail,
  openMessage,
  pickContact,
  snapshotFrom,
} from "@/lib/contacts";
import {
  formatDate,
  formatFrequency,
  formatMedium,
  formatRelative,
  fullName,
} from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { CatchUpEvent, EventStatus } from "@/types/database";

const FriendDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: friend, isLoading } = useFriend(id);
  const { data: events } = useEventsForFriend(id);
  const deleteFriend = useDeleteFriend();
  const linkContact = useLinkFriendContact();

  if (isLoading || !friend) {
    return (
      <Screen edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.fg.DEFAULT} />
        </View>
      </Screen>
    );
  }

  const lastCompleted = events?.find(
    (event) => event.status === "completed" && event.occurred_at,
  );

  const onDelete = () => {
    Alert.alert(
      "Delete friend?",
      "This will also delete all catch-up history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteFriend.mutateAsync(id!);
            router.back();
          },
        },
      ],
    );
  };

  const snapshot = snapshotFrom(friend.contact_snapshot);
  const phone = snapshot?.phone ?? null;
  const email = snapshot?.email ?? null;
  const contactId = friend.contact_id;

  const onLinkContact = async () => {
    try {
      const picked = await pickContact();
      if (!picked) return;
      await linkContact.mutateAsync({
        id: id!,
        contact_id: picked.contact_id,
        contact_snapshot: picked.snapshot as unknown as Record<string, unknown>,
        avatar_url: picked.avatar_url,
      });
    } catch (error) {
      Alert.alert("Couldn't link contact", (error as Error).message);
    }
  };

  const onMessage = () => {
    if (!phone) {
      Alert.alert(
        "No phone number",
        "This contact has no phone number on file.",
      );
      return;
    }
    openMessage(phone);
  };

  const onCall = () => {
    if (!phone) {
      Alert.alert(
        "No phone number",
        "This contact has no phone number on file.",
      );
      return;
    }
    openCall(phone);
  };

  const onEmail = () => {
    if (!email) {
      Alert.alert("No email", "This contact has no email on file.");
      return;
    }
    openEmail(email);
  };

  const onContact = () => {
    if (!contactId) return;
    openContactCard(contactId);
  };

  return (
    <Screen scroll edges={[]}>
      <Stack.Screen
        options={{
          title: "",
        }}
      />

      <View className="gap-4">
        <View className="items-center gap-3 pt-2">
          <FriendAvatar friend={friend} size="lg" />
          <Text className="text-2xl font-semibold text-center text-fg">
            {fullName(friend)}
          </Text>
        </View>

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
              icon="mail"
              label="Email"
              disabled={!email}
              onPress={onEmail}
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
            className="bg-surface-elevated rounded-2xl p-4 flex-row items-center gap-3"
          >
            <Ionicons name="person-add" size={20} color={colors.brand[300]} />
            <View className="flex-1">
              <Text className="text-base font-medium text-fg">
                {linkContact.isPending ? "Linking…" : "Link to phone contact"}
              </Text>
              <Text className="text-xs text-fg-muted mt-0.5">
                Enables Message, Call, and Contact actions.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.fg.subtle}
            />
          </Pressable>
        )}

        <View className="flex-row gap-2">
          <Link
            href={ROUTES.event.new({ friend_id: id, mode: "schedule" })}
            asChild
          >
            <Pressable className="flex-1 bg-brand-300 active:bg-brand-400 rounded-full px-4 py-3 items-center justify-center flex-row gap-2">
              <Ionicons
                name="calendar"
                size={18}
                color={colors.surface.DEFAULT}
              />
              <Text className="text-surface font-semibold">Schedule</Text>
            </Pressable>
          </Link>
          <Link
            href={ROUTES.event.new({ friend_id: id, mode: "logCatchUp" })}
            asChild
          >
            <Pressable className="flex-1 bg-surface-elevated active:bg-surface-high rounded-full px-4 py-3 items-center justify-center flex-row gap-2">
              <Ionicons name="create" size={18} color={colors.fg.DEFAULT} />
              <Text className="text-fg font-semibold">Log catch-up</Text>
            </Pressable>
          </Link>
        </View>

        <View className="bg-surface-elevated rounded-2xl p-4 gap-2">
          {lastCompleted?.occurred_at ? (
            <PressableRow
              label="Last caught up"
              value={`${formatRelative(lastCompleted.occurred_at)} (${formatDate(lastCompleted.occurred_at)})`}
              onPress={() => router.push(ROUTES.event.detail(lastCompleted.id))}
            />
          ) : (
            <Row label="Last caught up" value="No catch-ups yet" />
          )}
          <PressableRow
            label="Frequency"
            value={formatFrequency(
              friend.frequency_amount,
              friend.frequency_unit,
            )}
            onPress={() => router.push(ROUTES.friend.edit(id!))}
          />
        </View>

        {contactId ? (
          <Pressable
            onPress={onLinkContact}
            disabled={linkContact.isPending}
            className="self-center py-1 px-2"
            hitSlop={8}
          >
            <Text className="text-xs text-fg-muted">
              {linkContact.isPending
                ? "Updating…"
                : `Linked${snapshot?.name ? ` to ${snapshot.name}` : ""} · change`}
            </Text>
          </Pressable>
        ) : null}

        <View>
          <Text className="text-lg font-semibold text-fg mb-2">History</Text>
          {!events || events.length === 0 ? (
            <Text className="text-fg-muted">No events yet.</Text>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={events}
              keyExtractor={(event) => event.id}
              ItemSeparatorComponent={() => <View className="h-2" />}
              renderItem={({ item }) => <HistoryItem event={item} />}
            />
          )}
        </View>

        <Pressable
          onPress={onDelete}
          disabled={deleteFriend.isPending}
          className="self-center py-2 px-3 mt-2"
          hitSlop={8}
        >
          <Text className="text-sm text-danger-400 font-medium">
            {deleteFriend.isPending ? "Deleting…" : "Delete friend"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
};

export default FriendDetailScreen;

interface ContactActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const ContactActionButton = ({
  icon,
  label,
  onPress,
  disabled,
}: ContactActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={classNames(
        "flex-1 bg-surface-elevated rounded-xl py-3 items-center justify-center gap-1",
        disabled ? "opacity-40" : "active:bg-surface-high",
      )}
    >
      <Ionicons name={icon} size={22} color={colors.brand[300]} />
      <Text className="text-xs font-medium text-fg">{label}</Text>
    </Pressable>
  );
};

const STATUS_META: Record<
  EventStatus,
  { label: string; pill: string; text: string }
> = {
  scheduled: {
    label: "Scheduled",
    pill: "bg-brand-700/30 border-brand-700",
    text: "text-brand-300",
  },
  completed: {
    label: "Completed",
    pill: "bg-success-900/40 border-success-700",
    text: "text-success-300",
  },
  missed: {
    label: "Missed",
    pill: "bg-danger-900/40 border-danger-700",
    text: "text-danger-300",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-surface-high border-surface-border",
    text: "text-fg-muted",
  },
};

interface HistoryItemProps {
  event: CatchUpEvent;
}

const HistoryItem = ({ event }: HistoryItemProps) => {
  const meta = STATUS_META[event.status];
  const whenISO = event.occurred_at ?? event.scheduled_at;
  const when = whenISO ? new Date(whenISO) : null;
  const mediumText = event.medium
    ? `${formatMedium(event.medium)}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`
    : "";

  return (
    <Link href={ROUTES.event.detail(event.id)} asChild>
      <Pressable className="bg-surface-elevated rounded-xl p-3 gap-2">
        <View className="flex-row items-center gap-3">
          {when ? (
            <View className="h-12 w-12 rounded-lg bg-surface-high items-center justify-center">
              <Text className="text-[10px] font-semibold uppercase text-fg-subtle tracking-wider">
                {format(when, "MMM")}
              </Text>
              <Text
                className={classNames(
                  "font-bold text-fg leading-tight",
                  isThisYear(when) ? "text-xl" : "text-base",
                )}
              >
                {format(when, "d")}
              </Text>
              {!isThisYear(when) ? (
                <Text className="text-[9px] text-fg-subtle leading-tight">
                  {format(when, "yyyy")}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Text
            className="flex-1 text-base font-medium text-fg"
            numberOfLines={1}
          >
            {mediumText}
          </Text>
          <View
            className={classNames("px-2 py-0.5 rounded-full border", meta.pill)}
          >
            <Text className={classNames("text-xs font-semibold", meta.text)}>
              {meta.label}
            </Text>
          </View>
        </View>

        {event.event_notes ? (
          <Text className="text-sm text-fg-muted" numberOfLines={3}>
            {event.event_notes}
          </Text>
        ) : null}
      </Pressable>
    </Link>
  );
};
