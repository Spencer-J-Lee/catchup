// TODO: Review

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { PressableSurface } from "@/components/ui/Surface";
import { useEvent, useUpdateEvent } from "@/hooks/use-events";
import { useThemedColors } from "@/hooks/use-themed-colors";
import type { EventStatus } from "@/types/database";

type FollowUpStatus = Extract<
  EventStatus,
  "completed" | "missed" | "cancelled"
>;

interface StatusOption {
  status: FollowUpStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgClass: string;
  badgeClass: string;
  badgeTextClass: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    status: "completed",
    label: "Completed",
    icon: "checkmark",
    iconBgClass: "bg-success dark:bg-success-dk",
    badgeClass: "bg-success/15 dark:bg-success-dk/20",
    badgeTextClass: "text-success dark:text-success-dk",
  },
  {
    status: "missed",
    label: "Missed",
    icon: "close",
    iconBgClass: "bg-danger dark:bg-danger-dk",
    badgeClass: "bg-danger/15 dark:bg-danger-dk/20",
    badgeTextClass: "text-danger dark:text-danger-dk",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    icon: "remove",
    iconBgClass: "bg-high dark:bg-high-dk",
    badgeClass: "bg-high dark:bg-high-dk",
    badgeTextClass: "text-muted dark:text-muted-dk",
  },
];

const FADE_MS = 300;

const FollowUpScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemedColors();
  const { data: event, isLoading } = useEvent(id);
  const update = useUpdateEvent();

  const [selectedStatus, setSelectedStatus] = useState<FollowUpStatus | null>(
    null,
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (event) setNotes(event.event_notes ?? "");
  }, [event]);

  if (isLoading || !event) {
    return (
      <Screen edges={["bottom"]}>
        <View className="py-8 items-center justify-center">
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      </Screen>
    );
  }

  const submit = async (notesToSave: string | undefined) => {
    if (!selectedStatus) return;
    try {
      await update.mutateAsync({
        id: event.id,
        friend_id: event.friend_id,
        status: selectedStatus,
        ...(selectedStatus === "completed"
          ? { occurred_at: new Date().toISOString() }
          : {}),
        ...(notesToSave !== undefined
          ? { event_notes: notesToSave.trim() || null }
          : {}),
      });
      router.back();
    } catch (error) {
      Alert.alert("Failed to save", (error as Error).message);
    }
  };

  if (!selectedStatus) {
    return (
      <Screen edges={["bottom"]}>
        <Animated.View
          entering={FadeIn.duration(FADE_MS)}
          className="gap-4 pt-6 pb-4"
          key="step-status"
        >
          <View className="gap-2">
            {STATUS_OPTIONS.map((option) => (
              <PressableSurface
                key={option.status}
                onPress={() => setSelectedStatus(option.status)}
                className="flex-row items-center gap-4"
              >
                <View
                  className={`h-12 w-12 rounded-full items-center justify-center ${option.iconBgClass}`}
                >
                  <Ionicons
                    name={option.icon}
                    size={26}
                    color={
                      option.status === "cancelled"
                        ? colors.fgDefault
                        : colors.dangerFg
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-default dark:text-default-dk">
                    {option.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.fgSubtle}
                />
              </PressableSurface>
            ))}
          </View>
        </Animated.View>
      </Screen>
    );
  }

  const selectedOption = STATUS_OPTIONS.find(
    (option) => option.status === selectedStatus,
  )!;

  return (
    <Screen
      edges={["bottom"]}
      footer={
        <Animated.View
          entering={FadeIn.duration(FADE_MS)}
          className="gap-2"
          key="step-notes-footer"
        >
          <Button onPress={() => submit(notes)} loading={update.isPending}>
            Save
          </Button>
          <Button
            variant="secondary"
            onPress={() => submit(undefined)}
            disabled={update.isPending}
          >
            Skip
          </Button>
          <Pressable
            onPress={() => setSelectedStatus(null)}
            disabled={update.isPending}
            className="self-center py-2 px-3 mt-1"
            hitSlop={8}
          >
            <Text className="text-sm text-muted dark:text-muted-dk font-medium">
              Change status
            </Text>
          </Pressable>
        </Animated.View>
      }
    >
      <Animated.View
        entering={FadeIn.duration(FADE_MS)}
        className="gap-4 pt-6"
        key="step-notes"
      >
        <View className="flex-row justify-between gap-2">
          <Text className="text-2xl font-bold text-default dark:text-default-dk">
            Any notes?
          </Text>
          <View className="flex-row items-center gap-2">
            <View
              className={`h-8 w-8 rounded-full items-center justify-center ${selectedOption.iconBgClass}`}
            >
              <Ionicons
                name={selectedOption.icon}
                size={18}
                color={
                  selectedOption.status === "cancelled"
                    ? colors.fgDefault
                    : colors.dangerFg
                }
              />
            </View>
            <View
              className={`px-3 py-1 rounded-full ${selectedOption.badgeClass}`}
            >
              <Text
                className={`text-sm font-semibold ${selectedOption.badgeTextClass}`}
              >
                {selectedOption.label}
              </Text>
            </View>
          </View>
        </View>

        <Input
          placeholder="What came out of the conversation?"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          className="h-32"
        />
      </Animated.View>
    </Screen>
  );
};

export default FollowUpScreen;
