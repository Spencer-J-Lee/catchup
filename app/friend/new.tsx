// TODO: Review

import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { FrequencyPicker } from "@/components/friend/FrequencyPicker";
import { FriendAvatar } from "@/components/friend/FriendListItem/FriendAvatar";
import { Button } from "@/components/ui/Button";
import { MediaRow } from "@/components/ui/MediaRow";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useCreateFriend } from "@/hooks/use-friends";
import type { ContactSnapshot } from "@/lib/contacts";
import { friendInputSchema } from "@/lib/schemas";
import { toast, toastMutationError } from "@/lib/toast";
import type { FrequencyPreset, FrequencyUnit } from "@/types/database";

type ContactParams = {
  contact_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  contact_snapshot: string;
};

const NewFriendScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateFriend();
  const params = useLocalSearchParams<ContactParams>();

  const contactSnapshot = useMemo<ContactSnapshot | null>(() => {
    try {
      return JSON.parse(params.contact_snapshot) as ContactSnapshot;
    } catch {
      return null;
    }
  }, [params.contact_snapshot]);

  const [frequency, setFrequency] = useState<{
    preset: FrequencyPreset | null;
    amount: number | null;
    unit: FrequencyUnit | null;
  }>({ preset: null, amount: null, unit: null });

  const firstName = params.first_name;
  const lastName = params.last_name;
  const contactId = params.contact_id;
  const avatarUrl = params.avatar_url;

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
      toast.error("Invalid input", {
        description:
          parsed.error.issues[0]?.message ?? "Please check the fields",
      });
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
        contact_synced_at: new Date().toISOString(),
      });
      toast.success("Friend added");
      router.dismissAll();
    } catch (error) {
      toastMutationError(error, "Couldn't save friend");
    }
  };

  return (
    <Screen
      scroll
      edges={[]}
      footer={
        <Button
          onPress={onSave}
          loading={create.isPending}
          disabled={!firstName.trim()}
        >
          Save
        </Button>
      }
    >
      <View className="gap-4">
        <MediaRow
          leading={
            <FriendAvatar
              friend={{
                avatar_url: avatarUrl || null,
                first_name: firstName || "?",
                last_name: lastName || null,
              }}
            />
          }
          eyebrow="Linked contact"
          label={
            contactSnapshot?.name ??
            `${firstName} ${lastName}`.trim() ??
            "Contact"
          }
          subtitle={contactSnapshot?.phone ?? undefined}
        />

        <FrequencyPicker value={frequency} onChange={setFrequency} />
      </View>
    </Screen>
  );
};

export default NewFriendScreen;
