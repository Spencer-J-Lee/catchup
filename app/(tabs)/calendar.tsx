import { Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";

export default function CalendarScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-2xl font-bold text-gray-900">Calendar</Text>
        <Text className="text-gray-600 text-center">
          Phase 1.6 — agenda + month view of past and upcoming catch-ups will live here.
        </Text>
      </View>
    </Screen>
  );
}
