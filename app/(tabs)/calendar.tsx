import { Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";

const CalendarScreen = () => {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-2xl font-bold text-default dark:text-default-dk">
          Calendar
        </Text>
        <Text className="text-muted dark:text-muted-dk text-center">
          Phase 1.6 — agenda + month view of past and upcoming catch-ups will
          live here.
        </Text>
      </View>
    </Screen>
  );
};

export default CalendarScreen;
