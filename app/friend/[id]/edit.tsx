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

const EditFriendScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: friend } = useFriend(id);
  const update = useUpdateFriend();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [cadence, setCadence] = useState<{
    preset: CadencePreset | null;
    amount: number | null;
    unit: CadenceUnit | null;
  }>({ preset: null, amount: null, unit: null });

  useEffect(() => {
    if (!friend) return;
    setFirstName(friend.first_name);
    setLastName(friend.last_name ?? "");
    setGeneralNotes(friend.general_notes ?? "");
    setCadence({
      preset: friend.cadence_preset,
      amount: friend.cadence_amount,
      unit: friend.cadence_unit,
    });
  }, [friend]);

  const onSave = async () => {
    if (!id) return;
    const parsed = friendInputSchema.safeParse({
      first_name: firstName,
      last_name: lastName || null,
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
  };

  return (
    <Screen scroll>
      <View className="gap-4">
        <Input
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Input label="Last name" value={lastName} onChangeText={setLastName} />
        <Input
          label="Notes"
          value={generalNotes}
          onChangeText={setGeneralNotes}
          multiline
          textAlignVertical="top"
          className="min-h-24 max-h-40"
        />
        <CadencePicker value={cadence} onChange={setCadence} />
        <Button
          onPress={onSave}
          loading={update.isPending}
          disabled={!firstName.trim()}
        >
          Save
        </Button>
      </View>
    </Screen>
  );
};

export default EditFriendScreen;
