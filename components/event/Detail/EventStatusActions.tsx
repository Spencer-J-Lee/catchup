import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { EventStatus } from "@/types/database";

export type MarkableStatus = Exclude<EventStatus, "scheduled">;

interface EventStatusActionsProps {
  onMark: (status: MarkableStatus) => void;
  isPending: boolean;
}

export const EventStatusActions = ({
  onMark,
  isPending,
}: EventStatusActionsProps) => {
  return (
    <View className="gap-2">
      <Button onPress={() => onMark("completed")} loading={isPending}>
        Mark as completed
      </Button>
      <Button
        variant="secondary"
        onPress={() => onMark("missed")}
        loading={isPending}
      >
        Mark as missed
      </Button>
      <Button
        variant="secondary"
        onPress={() => onMark("cancelled")}
        loading={isPending}
      >
        Mark as cancelled
      </Button>
    </View>
  );
};
