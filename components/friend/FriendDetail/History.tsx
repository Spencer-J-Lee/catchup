import { FlatList, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import type { CatchUpEvent } from "@/types/database";

import { HistoryItem } from "./HistoryItem";

interface HistoryProps {
  events: CatchUpEvent[] | undefined;
}

export const History = ({ events }: HistoryProps) => {
  return (
    <View>
      <Text className="mb-2 text-lg font-semibold text-default dark:text-default-dk">
        History
      </Text>

      {!events || events.length === 0 ? (
        <View className="pb-6 pt-4">
          <EmptyState
            icon="time-outline"
            title="No catch-ups yet"
            description="Schedule or log your first catch-up to see history here."
          />
        </View>
      ) : (
        // Nested inside the screen's ScrollView, so scrolling is disabled and
        // virtualization is forfeited — a single friend's history is small.
        <FlatList
          scrollEnabled={false}
          data={events}
          keyExtractor={(event) => event.id}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => <HistoryItem event={item} />}
        />
      )}
    </View>
  );
};
