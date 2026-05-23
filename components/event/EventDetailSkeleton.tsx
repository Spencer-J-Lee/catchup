import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { Surface } from "@/components/ui/Surface";

export const EventDetailSkeleton = () => {
  return (
    <View className="gap-4">
      <Surface>
        <View className="gap-4">
          <View className="flex-row items-center justify-between">
            <Skeleton width={70} height={16} />
            <Skeleton width={90} height={18} />
          </View>
          <View className="flex-row items-center justify-between">
            <Skeleton width={90} height={16} />
            <Skeleton width={140} height={18} />
          </View>
          <View className="flex-row items-center justify-between">
            <Skeleton width={70} height={16} />
            <Skeleton width={100} height={18} />
          </View>
        </View>
      </Surface>

      <Surface>
        <View className="gap-2">
          <Skeleton width={50} height={14} />
          <Skeleton width="90%" height={18} />
          <Skeleton width="75%" height={18} />
        </View>
      </Surface>

      <View className="gap-2">
        <Skeleton width="100%" height={48} className="rounded-xl" />
        <Skeleton width="100%" height={48} className="rounded-xl" />
        <Skeleton width="100%" height={48} className="rounded-xl" />
      </View>
    </View>
  );
};
