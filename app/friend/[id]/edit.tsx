import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

import { CadencePicker } from "@/components/friend/CadencePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useFriend, useUpdateFriend } from "@/hooks/use-friends";
import { friendInputSchema } from "@/lib/schemas";
import type { CadencePreset, CadenceUnit } from "@/types/database";

export default function EditFriendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: friend } = useFriend(id);
  const update = useUpdateFriend();

  const [displayName, setDisplayName] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [cadence, setCadence] = useState<{
    preset: CadencePreset | null;
    amount: number | null;
    unit: CadenceUnit | null;
  }>({ preset: null, amount: null, unit: null });

  useEffect(() => {
    if (!friend) return;
    setDisplayName(friend.display_name);
    setGeneralNotes(friend.general_notes ?? "");
    setCadence({
      preset: friend.cadence_preset,
      amount: friend.cadence_amount,
      unit: friend.cadence_unit,
    });
  }, [friend]);

  async function onSave() {
    if (!id) return;
    const parsed = friendInputSchema.safeParse({
      display_name: displayName,
      general_notes: generalNotes || null,
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
    } catch (e) {
      Alert.alert("Failed to save", (e as Error).message);
    }
  }

  return (
    <Screen scroll>
      <View className="gap-4">
        <Input label="Name" value={displayName} onChangeText={setDisplayName} />
        <Input
          label="Notes"
          value={generalNotes}
          onChangeText={setGeneralNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="h-24"
        />
        <CadencePicker value={cadence} onChange={setCadence} />
        <Button onPress={onSave} loading={update.isPending} disabled={!displayName.trim()}>
          Save
        </Button>
      </View>
    </Screen>
  );
}
