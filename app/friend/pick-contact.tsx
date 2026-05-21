// TODO: Review

import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useFriends } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import {
  listContacts,
  requestContactsPermission,
  type ContactListItem,
} from "@/lib/contacts";
import { initialsOf } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

type PermissionState = "loading" | "granted" | "denied";

const PickContactScreen = () => {
  const router = useRouter();
  const colors = useThemedColors();
  const { data: friends } = useFriends();
  const [permission, setPermission] = useState<PermissionState>("loading");
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setPermission("loading");
    try {
      const status = await requestContactsPermission();
      // iOS 18 "limited" is also a usable state — getContactsAsync returns the
      // subset the user shared.
      const usable =
        status === Contacts.PermissionStatus.GRANTED ||
        (status as string) === "limited";
      if (!usable) {
        setPermission("denied");
        setContacts([]);
        return;
      }
      const list = await listContacts();
      setContacts(list);
      setPermission("granted");
    } catch (caught) {
      setError((caught as Error).message);
      setPermission("denied");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const linkedContactIds = useMemo(() => {
    const ids = new Set<string>();
    for (const friend of friends ?? []) {
      if (friend.contact_id) ids.add(friend.contact_id);
    }
    return ids;
  }, [friends]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (linkedContactIds.has(contact.id)) return false;
      if (!query) return true;
      return contact.display_name.toLowerCase().includes(query);
    });
  }, [contacts, search, linkedContactIds]);

  const goToNewFriend = (contact: ContactListItem) => {
    const [firstFallback, ...restFallback] = contact.display_name.split(" ");
    router.push(
      ROUTES.friend.new({
        contact_id: contact.id,
        first_name: contact.first_name ?? firstFallback ?? "",
        last_name: contact.last_name ?? restFallback.join(" "),
        avatar_url: contact.image_uri ?? "",
        contact_snapshot: JSON.stringify(contact.snapshot),
      }),
    );
  };

  if (permission === "loading") {
    return (
      <Screen edges={[]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      </Screen>
    );
  }

  if (permission === "denied") {
    return (
      <Screen edges={[]}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-full bg-raised dark:bg-raised-dk items-center justify-center mb-5">
            <Ionicons name="people-outline" size={36} color={colors.brand} />
          </View>
          <Text className="text-xl font-semibold text-default dark:text-default-dk mb-2 text-center">
            Contacts access needed
          </Text>
          <Text className="text-muted dark:text-muted-dk text-center mb-6">
            Allow CatchUp to read your contacts so you can add friends from
            them.
          </Text>
          {error ? (
            <Text className="text-danger dark:text-danger-dk text-sm mb-4">
              {error}
            </Text>
          ) : null}
          <Button onPress={() => Linking.openSettings()} className="px-6">
            Open Settings
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <View className="flex-1 gap-3">
        <Input
          placeholder="Search contacts"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        <FlatList
          data={filtered}
          keyExtractor={(contact) => contact.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
          ItemSeparatorComponent={() => <View className="h-1" />}
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-muted dark:text-muted-dk text-center">
                {search.trim()
                  ? `No contacts match "${search.trim()}"`
                  : contacts.length === 0
                    ? "No contacts found on this device."
                    : "All your contacts are already linked to a friend."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => goToNewFriend(item)}
              className="flex-row items-center gap-3 py-2 active:opacity-70"
            >
              {item.image_uri ? (
                <Image
                  source={{ uri: item.image_uri }}
                  className="h-12 w-12 rounded-full bg-raised dark:bg-raised-dk"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-12 w-12 rounded-full bg-raised dark:bg-raised-dk items-center justify-center">
                  <Text className="text-default dark:text-default-dk text-base font-semibold">
                    {initialsOf(
                      item.first_name ?? item.display_name,
                      item.last_name,
                    )}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-default dark:text-default-dk"
                  numberOfLines={1}
                >
                  {item.display_name}
                </Text>
                {item.phone ? (
                  <Text
                    className="text-sm text-muted dark:text-muted-dk"
                    numberOfLines={1}
                  >
                    {item.phone}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      </View>
    </Screen>
  );
};

export default PickContactScreen;
