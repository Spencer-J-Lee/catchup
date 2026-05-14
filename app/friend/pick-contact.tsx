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
import {
  listContacts,
  requestContactsPermission,
  type ContactListItem,
} from "@/lib/contacts";
import { initialsOf } from "@/lib/format";

type PermissionState = "loading" | "granted" | "denied";

export default function PickContactScreen() {
  const router = useRouter();
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
    } catch (e) {
      setError((e as Error).message);
      setPermission("denied");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const linkedContactIds = useMemo(() => {
    const ids = new Set<string>();
    for (const f of friends ?? []) {
      if (f.contact_id) ids.add(f.contact_id);
    }
    return ids;
  }, [friends]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (linkedContactIds.has(c.id)) return false;
      if (!q) return true;
      return c.display_name.toLowerCase().includes(q);
    });
  }, [contacts, search, linkedContactIds]);

  function goToNewFriend(contact?: ContactListItem) {
    if (!contact) {
      router.push("/friend/new");
      return;
    }
    const [firstFallback, ...restFallback] = contact.display_name.split(" ");
    router.push({
      pathname: "/friend/new",
      params: {
        contact_id: contact.id,
        first_name: contact.first_name ?? firstFallback ?? "",
        last_name: contact.last_name ?? restFallback.join(" "),
        avatar_url: contact.image_uri ?? "",
        contact_snapshot: JSON.stringify(contact.snapshot),
      },
    });
  }

  if (permission === "loading") {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      </Screen>
    );
  }

  if (permission === "denied") {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-full bg-surface-elevated items-center justify-center mb-5">
            <Ionicons name="people-outline" size={36} color="#f49b7c" />
          </View>
          <Text className="text-xl font-semibold text-fg mb-2 text-center">
            Contacts access needed
          </Text>
          <Text className="text-fg-muted text-center mb-6">
            Allow CatchUp to read your contacts to pick from them, or add a
            friend manually.
          </Text>
          {error ? (
            <Text className="text-red-400 text-sm mb-4">{error}</Text>
          ) : null}
          <Button onPress={() => Linking.openSettings()} className="px-6">
            Open Settings
          </Button>
          <Pressable
            onPress={() => goToNewFriend()}
            className="mt-4 py-2 px-3"
            hitSlop={8}
          >
            <Text className="text-brand-300 font-medium">Add manually</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
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
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
          ItemSeparatorComponent={() => <View className="h-1" />}
          ListHeaderComponent={
            <Pressable
              onPress={() => goToNewFriend()}
              className="bg-surface-elevated rounded-xl p-3 flex-row items-center gap-3 active:bg-surface-high mb-3"
            >
              <View className="h-12 w-12 rounded-full bg-surface items-center justify-center">
                <Ionicons name="person-add" size={20} color="#f49b7c" />
              </View>
              <Text className="text-base font-medium text-fg flex-1">
                Add without a contact
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#6e6e73" />
            </Pressable>
          }
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-fg-muted text-center">
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
                  className="h-12 w-12 rounded-full bg-surface-elevated"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-12 w-12 rounded-full bg-surface-elevated items-center justify-center">
                  <Text className="text-fg text-base font-semibold">
                    {initialsOf(
                      item.first_name ?? item.display_name,
                      item.last_name,
                    )}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-fg"
                  numberOfLines={1}
                >
                  {item.display_name}
                </Text>
                {item.phone ? (
                  <Text className="text-sm text-fg-muted" numberOfLines={1}>
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
}
