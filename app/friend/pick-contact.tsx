// TODO: Review

import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useNavigation, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { useCreateFriends, useFriends } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import {
  listContacts,
  requestContactsPermission,
  type ContactListItem,
} from "@/lib/contacts";
import { initialsOf } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { toast, toastMutationError } from "@/lib/toast";

type PermissionState = "loading" | "granted" | "denied";

const PickContactScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const colors = useThemedColors();
  const { user } = useAuth();
  const { data: friends } = useFriends();
  const createFriends = useCreateFriends();
  const [permission, setPermission] = useState<PermissionState>("loading");
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const contactsById = useMemo(() => {
    const map = new Map<string, ContactListItem>();
    for (const contact of contacts) map.set(contact.id, contact);
    return map;
  }, [contacts]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  useLayoutEffect(() => {
    if (permission !== "granted") {
      navigation.setOptions({ headerRight: undefined });
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
          hitSlop={8}
        >
          <Text
            className="text-base font-medium"
            style={{ color: colors.brand }}
          >
            {selectMode ? "Cancel" : "Select"}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, selectMode, permission, colors.brand, exitSelectMode]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onAddSelected = async () => {
    if (!user) return;

    const now = new Date().toISOString();
    const inputs = Array.from(selectedIds)
      .map((id) => contactsById.get(id))
      .filter((contact): contact is ContactListItem => contact !== undefined)
      .map((contact) => {
        const [firstFallback, ...restFallback] =
          contact.display_name.split(" ");
        return {
          user_id: user.id,
          first_name: contact.first_name ?? firstFallback ?? "",
          last_name: contact.last_name ?? restFallback.join(" ") ?? null,
          contact_id: contact.id,
          contact_snapshot:
            (contact.snapshot as unknown as Record<string, unknown>) ?? null,
          avatar_url: contact.image_uri ?? null,
          contact_synced_at: now,
        };
      });

    if (inputs.length === 0) return;

    try {
      await createFriends.mutateAsync(inputs);
      toast.success(
        `Added ${inputs.length} friend${inputs.length === 1 ? "" : "s"}`,
      );
      router.dismissAll();
    } catch (caught) {
      toastMutationError(caught, "Couldn't add friends");
    }
  };

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

  const selectedCount = selectedIds.size;

  return (
    <Screen
      edges={[]}
      footer={
        selectMode && selectedCount > 0 ? (
          <Button onPress={onAddSelected} loading={createFriends.isPending}>
            {`Add ${selectedCount} friend${selectedCount === 1 ? "" : "s"}`}
          </Button>
        ) : undefined
      }
    >
      <View className="flex-1 gap-3 pt-4">
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
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);

            return (
              <Pressable
                onPress={() =>
                  selectMode ? toggleSelected(item.id) : goToNewFriend(item)
                }
                onLongPress={() => {
                  if (!selectMode) {
                    setSelectMode(true);
                    toggleSelected(item.id);
                  }
                }}
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

                {selectMode ? (
                  <View
                    className="h-6 w-6 rounded-full items-center justify-center"
                    style={
                      isSelected
                        ? { backgroundColor: colors.brand }
                        : {
                            borderWidth: 1.5,
                            borderColor: colors.fgMuted,
                          }
                    }
                  >
                    {isSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.brandFg}
                      />
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Screen>
  );
};

export default PickContactScreen;
