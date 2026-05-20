// TODO: Review

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { FrequencyPicker } from "@/components/friend/FrequencyPicker";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useFriend, useUpdateFriend } from "@/hooks/use-friends";
import { friendInputSchema } from "@/lib/schemas";
import { toast, toastMutationError } from "@/lib/toast";
import type { FrequencyPreset, FrequencyUnit } from "@/types/database";

const EditFriendScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: friend } = useFriend(id);
  const update = useUpdateFriend();

  const [frequency, setFrequency] = useState<{
    preset: FrequencyPreset | null;
    amount: number | null;
    unit: FrequencyUnit | null;
  }>({ preset: null, amount: null, unit: null });

  useEffect(() => {
    if (!friend) return;
    setFrequency({
      preset: friend.frequency_preset,
      amount: friend.frequency_amount,
      unit: friend.frequency_unit,
    });
  }, [friend]);

  const onSave = async () => {
    if (!id || !friend) return;
    const parsed = friendInputSchema.safeParse({
      first_name: friend.first_name,
      last_name: friend.last_name,
      frequency_preset: frequency.preset,
      frequency_amount: frequency.amount,
      frequency_unit: frequency.unit,
    });
    if (!parsed.success) {
      toast.error("Invalid input", {
        description: parsed.error.issues[0]?.message ?? "",
      });
      return;
    }
    try {
      await update.mutateAsync({ id, ...parsed.data });
      toast.success("Saved");
      router.back();
    } catch (error) {
      toastMutationError(error, "Couldn't save changes");
    }
  };

  return (
    <Screen
      scroll
      edges={["bottom"]}
      footer={
        <Button onPress={onSave} loading={update.isPending}>
          Save
        </Button>
      }
    >
      <View className="gap-4">
        <FrequencyPicker value={frequency} onChange={setFrequency} />
      </View>
    </Screen>
  );
};

export default EditFriendScreen;
