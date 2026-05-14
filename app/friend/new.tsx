import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { CadencePicker } from "@/components/friend/CadencePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useCreateFriend } from "@/hooks/use-friends";
import { friendInputSchema } from "@/lib/schemas";
import type { CadencePreset, CadenceUnit } from "@/types/database";

export default function NewFriendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateFriend();

  const [displayName, setDisplayName] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [cadence, setCadence] = useState<{
    preset: CadencePreset | null;
    amount: number | null;
    unit: CadenceUnit | null;
  }>({ preset: null, amount: null, unit: null });

  async function onSave() {
    if (!user) return;
    const parsed = friendInputSchema.safeParse({
      display_name: displayName,
      general_notes: generalNotes || null,
      cadence_preset: cadence.preset,
      cadence_amount: cadence.amount,
      cadence_unit: cadence.unit,
    });
    if (!parsed.success) {
      Alert.alert("Invalid input", parsed.error.issues[0]?.message ?? "Please check the fields");
      return;
    }
    try {
      await create.mutateAsync({ ...parsed.data, user_id: user.id });
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
        <Button onPress={onSave} loading={create.isPending} disabled={!displayName.trim()}>
          Save
        </Button>
        <Text className="text-xs text-fg-muted text-center">
          Phase 2 will add a "Pick from contacts" button here.
        </Text>
      </View>
    </Screen>
  );
}
