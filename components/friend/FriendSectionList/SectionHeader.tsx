// TODO: BEEG REVIEW 1

import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { DashedDivider } from "@/components/ui/DashedDivider";
import { useThemedColors } from "@/hooks/use-themed-colors";
import type { FriendLifecycleState } from "@/lib/lifecycle";

const SECTION_ICONS: Record<
  FriendLifecycleState,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  awaiting_followup: "sparkles-outline",
  scheduled: "calendar-outline",
  due: "time-outline",
  caught_up: "checkmark-circle-outline",
};

interface SectionHeaderProps {
  state: FriendLifecycleState;
  title: string;
}

export const SectionHeader = ({ state, title }: SectionHeaderProps) => {
  const colors = useThemedColors();
  return (
    <View className="bg-app dark:bg-app-dk pb-2 px-4 flex-row items-center gap-2">
      <Ionicons name={SECTION_ICONS[state]} size={16} color={colors.fgMuted} />
      <Text className="text-base font-medium text-muted dark:text-muted-dk">
        {title}
      </Text>
      <DashedDivider className="flex-1" />
    </View>
  );
};
