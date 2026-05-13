import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { clearSeedData, seedExampleData } from "@/lib/seed";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function onSeed() {
    if (!user) return;
    setSeeding(true);
    try {
      const r = await seedExampleData(user.id);
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["events"] });
      Alert.alert(
        "Seed data loaded",
        `Removed ${r.friendsDeleted} previous seed friend${r.friendsDeleted === 1 ? "" : "s"}.\nCreated ${r.friendsCreated} friends and ${r.eventsCreated} events.`,
      );
    } catch (e) {
      Alert.alert("Failed to seed", (e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  function onClear() {
    if (!user) return;
    Alert.alert(
      "Clear seed data?",
      "This deletes every friend whose name starts with [Seed], along with their catch-up history. Your other friends are untouched.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              const n = await clearSeedData(user.id);
              qc.invalidateQueries({ queryKey: ["friends"] });
              qc.invalidateQueries({ queryKey: ["events"] });
              Alert.alert("Seed data cleared", `Removed ${n} friend${n === 1 ? "" : "s"}.`);
            } catch (e) {
              Alert.alert("Failed to clear", (e as Error).message);
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen scroll>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
        <View className="gap-1">
          <Text className="text-sm text-gray-500">Signed in as</Text>
          <Text className="text-base text-gray-900">{user?.email ?? "—"}</Text>
        </View>

        <View className="gap-2 mt-4">
          <Text className="text-xs uppercase tracking-wide font-semibold text-gray-500">
            Developer
          </Text>
          <Text className="text-sm text-gray-600">
            Loads a curated set of example friends and catch-up events covering due,
            not-due, missing-cadence, never-caught-up, scheduled, missed, and cancelled
            cases. Re-running replaces previous seed data.
          </Text>
          <Button onPress={onSeed} loading={seeding} disabled={clearing}>
            Load example data
          </Button>
          <Button variant="secondary" onPress={onClear} loading={clearing} disabled={seeding}>
            Clear seed data
          </Button>
        </View>

        <Button variant="destructive" onPress={() => signOut()}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
}
