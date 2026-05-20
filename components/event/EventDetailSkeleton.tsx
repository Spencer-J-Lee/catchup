import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { Surface } from "@/components/ui/Surface";

export const EventDetailSkeleton = () => {
  return (
    <View className="gap-4">
      <Surface>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Skeleton width={70} height={14} />
            <Skeleton width={90} height={14} />
          </View>
          <View className="flex-row justify-between">
            <Skeleton width={90} height={14} />
            <Skeleton width={140} height={14} />
          </View>
          <View className="flex-row justify-between">
            <Skeleton width={70} height={14} />
            <Skeleton width={100} height={14} />
          </View>
        </View>
      </Surface>

      <Surface>
        <View className="gap-2">
          <Skeleton width={50} height={12} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="75%" height={14} />
        </View>
      </Surface>

      <View className="gap-2">
        <Skeleton width="100%" height={44} className="rounded-full" />
        <Skeleton width="100%" height={44} className="rounded-full" />
      </View>
    </View>
  );
};
