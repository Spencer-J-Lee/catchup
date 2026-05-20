// TODO: Review

import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { isThisYear } from "date-fns";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";

import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { FriendDetailSkeleton } from "@/components/friend/FriendDetailSkeleton";
import { FriendAvatar } from "@/components/friend/FriendListItem/FriendAvatar";
import { DividedList } from "@/components/ui/DividedList";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconActionRow } from "@/components/ui/IconActionRow";
import { PressableRow } from "@/components/ui/PressableRow";
import { Row } from "@/components/ui/Row";
import { Screen } from "@/components/ui/Screen";
import { PressableSurface, Surface } from "@/components/ui/Surface";
import { useEventsForFriend } from "@/hooks/use-events";
import { useFormatters } from "@/hooks/use-formatters";
import {
  useDeleteFriend,
  useFriend,
  useLinkFriendContact,
} from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import {
  openCall,
  openContactCard,
  openEmail,
  openMessage,
  pickContact,
  snapshotFrom,
} from "@/lib/contacts";
import { formatFrequency, formatMedium, fullName } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { toast, toastMutationError } from "@/lib/toast";
import type { CatchUpEvent, EventStatus } from "@/types/database";

const FriendDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemedColors();
  const { data: friend, isLoading } = useFriend(id);
  const { data: events } = useEventsForFriend(id);
  const deleteFriend = useDeleteFriend();
  const linkContact = useLinkFriendContact();

  if (isLoading || !friend) {
    return (
      <Screen scroll edges={[]}>
        <FriendDetailSkeleton />
      </Screen>
    );
  }

  const lastCompleted = events?.find((event) => event.status === "completed");

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
      toast.success("Linked contact");
    } catch (error) {
      toastMutationError(error, "Couldn't link contact");
    }
  };

  const onMessage = () => {
    if (!phone) {
      toast.info("No phone number on file");
      return;
    }
    openMessage(phone);
  };

  const onCall = () => {
    if (!phone) {
      toast.info("No phone number on file");
      return;
    }
    openCall(phone);
  };

  const onEmail = () => {
    if (!email) {
      toast.info("No email on file");
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
          <Text className="text-2xl font-semibold text-center text-default dark:text-default-dk">
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
          <IconActionRow
            label={linkContact.isPending ? "Linking…" : "Link to phone contact"}
            subtitle="Enables Message, Call, and Contact actions."
            icon="person-add"
            iconColor={colors.brand}
            onPress={onLinkContact}
            disabled={linkContact.isPending}
          />
        )}

        <View className="flex-row gap-2">
          <Link
            href={ROUTES.event.new({ friend_id: id, mode: "schedule" })}
            asChild
          >
            <Pressable className="flex-1 bg-brand dark:bg-brand-dk active:bg-brand-hov dark:active:bg-brand-hov-dk rounded-full px-4 py-3 items-center justify-center flex-row gap-2">
              <Ionicons name="calendar" size={18} color={colors.dangerFg} />
              <Text className="text-danger-fg font-semibold">Schedule</Text>
            </Pressable>
          </Link>
          <Link
            href={ROUTES.event.new({ friend_id: id, mode: "logCatchUp" })}
            asChild
          >
            <Pressable className="flex-1 bg-raised dark:bg-raised-dk active:bg-high dark:active:bg-high-dk rounded-full px-4 py-3 items-center justify-center flex-row gap-2">
              <Ionicons name="create" size={18} color={colors.fgDefault} />
              <Text className="text-default dark:text-default-dk font-semibold">
                Log catch-up
              </Text>
            </Pressable>
          </Link>
        </View>

        <Surface>
          <DividedList>
            {lastCompleted ? (
              <PressableRow
                label="Last caught up"
                value={`${formatRelative(lastCompleted.event_at)} (${formatDate(lastCompleted.event_at)})`}
                onPress={() =>
                  router.push(ROUTES.event.detail(lastCompleted.id))
                }
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
          </DividedList>
        </Surface>

        {contactId ? (
          <Pressable
            onPress={onLinkContact}
            disabled={linkContact.isPending}
            className="self-center py-1 px-2"
            hitSlop={8}
          >
            <Text className="text-xs text-muted dark:text-muted-dk">
              {linkContact.isPending
                ? "Updating…"
                : `Linked${snapshot?.name ? ` to ${snapshot.name}` : ""} · change`}
            </Text>
          </Pressable>
        ) : null}

        <View>
          <Text className="text-lg font-semibold text-default dark:text-default-dk mb-2">
            History
          </Text>
          {!events || events.length === 0 ? (
            <View className="py-6">
              <EmptyState
                icon="time-outline"
                title="No catch-ups yet"
                description="Schedule or log your first catch-up to see history here."
              />
            </View>
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
          <Text className="text-sm text-danger dark:text-danger-dk font-medium">
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
  const colors = useThemedColors();
  return (
    <PressableSurface
      onPress={onPress}
      disabled={disabled}
      size="sm"
      className="flex-1 items-center justify-center gap-1"
    >
      <Ionicons name={icon} size={22} color={colors.brand} />
      <Text className="text-xs font-medium text-default dark:text-default-dk">
        {label}
      </Text>
    </PressableSurface>
  );
};

const STATUS_META: Record<
  EventStatus,
  { label: string; pill: string; text: string }
> = {
  scheduled: {
    label: "Scheduled",
    pill: "bg-brand/15 dark:bg-brand-dk/25 border-brand dark:border-brand-dk",
    text: "text-brand dark:text-brand-dk",
  },
  completed: {
    label: "Completed",
    pill: "bg-success/15 dark:bg-success-dk/25 border-success dark:border-success-dk",
    text: "text-success dark:text-success-dk",
  },
  missed: {
    label: "Missed",
    pill: "bg-danger/15 dark:bg-danger-dk/25 border-danger dark:border-danger-dk",
    text: "text-danger dark:text-danger-dk",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-high dark:bg-high-dk border-border dark:border-border-dk",
    text: "text-muted dark:text-muted-dk",
  },
};

interface HistoryItemProps {
  event: CatchUpEvent;
}

const HistoryItem = ({ event }: HistoryItemProps) => {
  const meta = STATUS_META[event.status];
  const when = new Date(event.event_at);
  const { formatPattern } = useFormatters();
  const mediumText = event.medium
    ? `${formatMedium(event.medium)}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`
    : "";

  return (
    <Link href={ROUTES.event.detail(event.id)} asChild>
      <PressableSurface size="sm" className="gap-2">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 rounded-lg bg-high dark:bg-high-dk items-center justify-center">
            <Text className="text-[10px] font-semibold uppercase text-subtle dark:text-subtle-dk tracking-wider">
              {formatPattern(when, "MMM")}
            </Text>
            <Text
              className={classNames(
                "font-bold text-default dark:text-default-dk leading-tight",
                isThisYear(when) ? "text-xl" : "text-base",
              )}
            >
              {formatPattern(when, "d")}
            </Text>
            {!isThisYear(when) ? (
              <Text className="text-[9px] text-subtle dark:text-subtle-dk leading-tight">
                {formatPattern(when, "yyyy")}
              </Text>
            ) : null}
          </View>
          <Text
            className="flex-1 text-base font-medium text-default dark:text-default-dk"
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
          <Text
            className="text-sm text-muted dark:text-muted-dk"
            numberOfLines={3}
          >
            {event.event_notes}
          </Text>
        ) : null}
      </PressableSurface>
    </Link>
  );
};
