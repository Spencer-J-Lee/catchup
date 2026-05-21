import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useThemedColors } from "@/hooks/use-themed-colors";

import { FADE_MS, type StatusOption } from "./statusOptions";

interface NotesStepProps {
  selectedOption: StatusOption;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onChangeStatus: () => void;
  isSubmitting: boolean;
}

export const NotesStep = ({
  selectedOption,
  notes,
  onNotesChange,
  onSave,
  onSkip,
  onChangeStatus,
  isSubmitting,
}: NotesStepProps) => {
  const colors = useThemedColors();

  return (
    <Screen
      edges={["bottom"]}
      footer={
        <Animated.View
          entering={FadeIn.duration(FADE_MS)}
          className="gap-2"
          key="step-notes-footer"
        >
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              onPress={onSkip}
              disabled={isSubmitting}
              className="flex-1"
            >
              Skip
            </Button>
            <Button onPress={onSave} loading={isSubmitting} className="flex-1">
              Save
            </Button>
          </View>
          <Pressable
            onPress={onChangeStatus}
            disabled={isSubmitting}
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
        className="gap-4 py-6"
        key="step-notes"
      >
        <View className="flex-row justify-between gap-2">
          <Text className="text-2xl font-bold text-default dark:text-default-dk">
            Notes
          </Text>
          <View className="flex-row items-center gap-2">
            <View
              className={`h-8 w-8 rounded-full items-center justify-center ${selectedOption.iconBgClass}`}
            >
              <Ionicons
                name={selectedOption.icon}
                size={20}
                color={colors.dangerFg}
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
          value={notes}
          placeholder="What came out of the conversation?"
          onChangeText={onNotesChange}
          multiline
          className="h-32"
          textAlignVertical="top"
        />
      </Animated.View>
    </Screen>
  );
};
