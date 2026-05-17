import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

import { CadencePicker } from "@/components/friend/CadencePicker";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useFriend, useUpdateFriend } from "@/hooks/use-friends";
import { friendInputSchema } from "@/lib/schemas";
import type { CadencePreset, CadenceUnit } from "@/types/database";

const EditFriendScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: friend } = useFriend(id);
  const update = useUpdateFriend();

  const [cadence, setCadence] = useState<{
    preset: CadencePreset | null;
    amount: number | null;
    unit: CadenceUnit | null;
  }>({ preset: null, amount: null, unit: null });

  useEffect(() => {
    if (!friend) return;
    setCadence({
      preset: friend.cadence_preset,
      amount: friend.cadence_amount,
      unit: friend.cadence_unit,
    });
  }, [friend]);

  const onSave = async () => {
    if (!id || !friend) return;
    const parsed = friendInputSchema.safeParse({
      first_name: friend.first_name,
      last_name: friend.last_name,
      cadence_preset: cadence.preset,
      cadence_amount: cadence.amount,
      cadence_unit: cadence.unit,
    });
    if (!parsed.success) {
      Alert.alert("Invalid input", parsed.error.issues[0]?.message ?? "");
      return;
    }
    try {
      await update.mutateAsync({ id, ...parsed.data });
      router.back();
    } catch (error) {
      Alert.alert("Failed to save", (error as Error).message);
    }
  };

  return (
    <Screen scroll edges={[]}>
      <View className="gap-4">
        <CadencePicker value={cadence} onChange={setCadence} />
        <Button onPress={onSave} loading={update.isPending}>
          Save
        </Button>
      </View>
    </Screen>
  );
};

export default EditFriendScreen;
