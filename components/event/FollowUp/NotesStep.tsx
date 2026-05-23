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
      edges={[]}
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
            className="mt-1 self-center px-3 py-2"
            hitSlop={8}
          >
            <Text className="text-sm font-medium text-muted dark:text-muted-dk">
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
              className={`h-8 w-8 items-center justify-center rounded-full ${selectedOption.iconBgClass}`}
            >
              <Ionicons
                name={selectedOption.icon}
                size={20}
                color={colors.dangerFg}
              />
            </View>
            <View
              className={`rounded-full px-3 py-1 ${selectedOption.badgeClass}`}
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
