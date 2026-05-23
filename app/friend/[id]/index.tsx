import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { ContactActionButton } from "@/components/friend/FriendDetail/ContactActionButton";
import { FriendDetailSkeleton } from "@/components/friend/FriendDetail/FriendDetailSkeleton";
import { HeaderMenu } from "@/components/friend/FriendDetail/HeaderMenu";
import { History } from "@/components/friend/FriendDetail/History";
import { FriendAvatar } from "@/components/friend/FriendListItem/FriendAvatar";
import { DividedList } from "@/components/ui/DividedList";
import { IconActionRow } from "@/components/ui/IconActionRow";
import { PressableRow } from "@/components/ui/PressableRow";
import { Row } from "@/components/ui/Row";
import { Screen } from "@/components/ui/Screen";
import { Surface } from "@/components/ui/Surface";
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
import { formatFrequency, fullName } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { toast, toastMutationError } from "@/lib/toast";

const FriendDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: friend, isLoading } = useFriend(id);
  const { data: events } = useEventsForFriend(id);
  const deleteFriend = useDeleteFriend();
  const linkContact = useLinkFriendContact();

  const colors = useThemedColors();
  const { formatDate, formatRelative } = useFormatters();

  if (isLoading || !friend) {
    return (
      <Screen scroll edges={[]}>
        <FriendDetailSkeleton />
      </Screen>
    );
  }

  const snapshot = snapshotFrom(friend.contact_snapshot);
  const phone = snapshot?.phone ?? null;
  const email = snapshot?.email ?? null;
  const contactId = friend.contact_id;
  const lastCompleted = events?.find((event) => event.status === "completed");

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

  return (
    <Screen scroll edges={[]}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => <HeaderMenu onDelete={onDelete} />,
        }}
      />

      <View className="gap-4">
        <View className="items-center gap-3 pt-2">
          <FriendAvatar friend={friend} size="lg" />
          <Text className="text-center text-2xl font-semibold text-default dark:text-default-dk">
            {fullName(friend)}
          </Text>
        </View>

        {contactId ? (
          <View className="flex-row gap-2">
            <ContactActionButton
              icon="chatbubble-ellipses"
              label="Message"
              disabled={!phone}
              onPress={() => openMessage(phone!)}
            />
            <ContactActionButton
              icon="call"
              label="Call"
              disabled={!phone}
              onPress={() => openCall(phone!)}
            />
            <ContactActionButton
              icon="mail"
              label="Email"
              disabled={!email}
              onPress={() => openEmail(email!)}
            />
            <ContactActionButton
              icon="person-circle"
              label="Contact"
              onPress={() => openContactCard(contactId)}
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
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 active:bg-brand-hov dark:bg-brand-dk dark:active:bg-brand-hov-dk">
              <Ionicons name="calendar" size={18} color={colors.dangerFg} />
              <Text className="font-semibold text-danger-fg">Schedule</Text>
            </Pressable>
          </Link>
          <Link
            href={ROUTES.event.new({ friend_id: id, mode: "logCatchUp" })}
            asChild
          >
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-raised px-4 py-3 active:bg-high dark:bg-raised-dk dark:active:bg-high-dk">
              <Ionicons name="create" size={18} color={colors.fgDefault} />
              <Text className="font-semibold text-default dark:text-default-dk">
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
            className="self-center px-2 py-1"
            hitSlop={8}
          >
            <Text className="text-xs text-muted dark:text-muted-dk">
              {linkContact.isPending
                ? "Updating…"
                : `Linked${snapshot?.name ? ` to ${snapshot.name}` : ""} · change`}
            </Text>
          </Pressable>
        ) : null}

        <History events={events} />
      </View>
    </Screen>
  );
};

export default FriendDetailScreen;
