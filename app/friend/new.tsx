import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Image, Text, View } from "react-native";

import { FrequencyPicker } from "@/components/friend/FrequencyPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useCreateFriend } from "@/hooks/use-friends";
import type { ContactSnapshot } from "@/lib/contacts";
import { initialsOf } from "@/lib/format";
import { friendInputSchema } from "@/lib/schemas";
import type { FrequencyPreset, FrequencyUnit } from "@/types/database";

type ContactParams = {
  contact_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  contact_snapshot?: string;
};

const NewFriendScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateFriend();
  const params = useLocalSearchParams<ContactParams>();

  const contactSnapshot = useMemo<ContactSnapshot | null>(() => {
    if (!params.contact_snapshot) return null;
    try {
      return JSON.parse(params.contact_snapshot) as ContactSnapshot;
    } catch {
      return null;
    }
  }, [params.contact_snapshot]);

  const [firstName, setFirstName] = useState(params.first_name ?? "");
  const [lastName, setLastName] = useState(params.last_name ?? "");
  const [frequency, setFrequency] = useState<{
    preset: FrequencyPreset | null;
    amount: number | null;
    unit: FrequencyUnit | null;
  }>({ preset: null, amount: null, unit: null });

  const contactId = params.contact_id || null;
  const avatarUrl = params.avatar_url || null;

  const onSave = async () => {
    if (!user) return;
    const parsed = friendInputSchema.safeParse({
      first_name: firstName,
      last_name: lastName || null,
      frequency_preset: frequency.preset,
      frequency_amount: frequency.amount,
      frequency_unit: frequency.unit,
    });
    if (!parsed.success) {
      Alert.alert(
        "Invalid input",
        parsed.error.issues[0]?.message ?? "Please check the fields",
      );
      return;
    }
    try {
      await create.mutateAsync({
        ...parsed.data,
        user_id: user.id,
        contact_id: contactId,
        contact_snapshot: contactSnapshot
          ? (contactSnapshot as unknown as Record<string, unknown>)
          : null,
        avatar_url: avatarUrl,
        contact_synced_at: contactId ? new Date().toISOString() : null,
      });
      router.dismissAll();
    } catch (error) {
      Alert.alert("Failed to save", (error as Error).message);
    }
  };

  return (
    <Screen scroll edges={[]}>
      <View className="gap-4">
        {contactId ? (
          <View className="flex-row items-center gap-3 bg-raised dark:bg-raised-dk rounded-2xl p-3">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="h-14 w-14 rounded-full bg-app dark:bg-app-dk"
                resizeMode="cover"
              />
            ) : (
              <View className="h-14 w-14 rounded-full bg-app dark:bg-app-dk items-center justify-center">
                <Text className="text-default dark:text-default-dk text-base font-semibold">
                  {initialsOf(firstName || "?", lastName)}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-wider text-subtle dark:text-subtle-dk">
                Linked contact
              </Text>
              <Text
                className="text-base font-medium text-default dark:text-default-dk"
                numberOfLines={1}
              >
                {contactSnapshot?.name ??
                  `${firstName} ${lastName}`.trim() ??
                  "Contact"}
              </Text>
              {contactSnapshot?.phone ? (
                <Text
                  className="text-sm text-muted dark:text-muted-dk"
                  numberOfLines={1}
                >
                  {contactSnapshot.phone}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <Input
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Input label="Last name" value={lastName} onChangeText={setLastName} />
        <FrequencyPicker value={frequency} onChange={setFrequency} />
        <Button
          onPress={onSave}
          loading={create.isPending}
          disabled={!firstName.trim()}
        >
          Save
        </Button>
      </View>
    </Screen>
  );
};

export default NewFriendScreen;
