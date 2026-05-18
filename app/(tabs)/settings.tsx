import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { ThemeSection } from "@/components/settings/ThemeSection";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { clearSeedData, seedExampleData } from "@/lib/seed";

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const onSeed = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const result = await seedExampleData(user.id);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      Alert.alert(
        "Seed data loaded",
        `Removed ${result.friendsDeleted} previous seed friend${result.friendsDeleted === 1 ? "" : "s"}.\nCreated ${result.friendsCreated} friends and ${result.eventsCreated} events.`,
      );
    } catch (error) {
      Alert.alert("Failed to seed", (error as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  const onClear = () => {
    if (!user) return;
    Alert.alert(
      "Clear seed data?",
      "This deletes every seed-marked friend (last name ending in ·), along with their catch-up history. Your other friends are untouched.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              const removedCount = await clearSeedData(user.id);
              queryClient.invalidateQueries({ queryKey: ["friends"] });
              queryClient.invalidateQueries({ queryKey: ["events"] });
              Alert.alert(
                "Seed data cleared",
                `Removed ${removedCount} friend${removedCount === 1 ? "" : "s"}.`,
              );
            } catch (error) {
              Alert.alert("Failed to clear", (error as Error).message);
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <View className="gap-6">
        <Text className="text-2xl font-bold text-default dark:text-default-dk">
          Settings
        </Text>
        <View className="gap-1">
          <Text className="text-sm text-muted dark:text-muted-dk">
            Signed in as
          </Text>
          <Text className="text-base text-default dark:text-default-dk">
            {user?.email ?? "—"}
          </Text>
        </View>

        <ThemeSection />

        <View className="gap-2 mt-4">
          <Text className="text-xs uppercase tracking-wide font-semibold text-muted dark:text-muted-dk">
            Developer
          </Text>
          <Text className="text-sm text-muted dark:text-muted-dk">
            Loads a curated set of example friends and catch-up events covering
            due, not-due, missing-frequency, never-caught-up, scheduled, missed,
            and cancelled cases. Re-running replaces previous seed data.
          </Text>
          <Button onPress={onSeed} loading={seeding} disabled={clearing}>
            Load example data
          </Button>
          <Button
            variant="secondary"
            onPress={onClear}
            loading={clearing}
            disabled={seeding}
          >
            Clear seed data
          </Button>
        </View>

        <Button variant="destructive" onPress={() => signOut()}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
};

export default SettingsScreen;
