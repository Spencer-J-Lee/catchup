import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";

import { Button } from "@/components/ui/Button";
import { DeveloperCard } from "@/components/ui/DeveloperCard";
import { useAuth } from "@/hooks/use-auth";
import { clearSeedData, seedExampleData } from "@/lib/seed";
import { toast, toastMutationError } from "@/lib/toast";

export const SeedDataSection = () => {
  const { user } = useAuth();
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
      toast.success("Seed data loaded", {
        description: `Removed ${result.friendsDeleted} previous seed friend${result.friendsDeleted === 1 ? "" : "s"}. Created ${result.friendsCreated} friends and ${result.eventsCreated} events.`,
      });
    } catch (error) {
      toastMutationError(error, "Couldn't seed data");
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
              toast.success(
                `Cleared ${removedCount} seed friend${removedCount === 1 ? "" : "s"}`,
              );
            } catch (error) {
              toastMutationError(error, "Couldn't clear seed data");
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <DeveloperCard
      title="Seed data"
      description="Loads a curated set of example friends and catch-up events covering due, not-due, missing-frequency, never-caught-up, scheduled, missed, and cancelled cases. Re-running replaces previous seed data."
    >
      <Button onPress={onSeed} loading={seeding} disabled={clearing}>
        Load example data
      </Button>
      <Button
        variant="destructive"
        onPress={onClear}
        loading={clearing}
        disabled={seeding}
      >
        Clear seed data
      </Button>
    </DeveloperCard>
  );
};
