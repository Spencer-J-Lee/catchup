import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { Surface } from "@/components/ui/Surface";

const HISTORY_ROW_COUNT = 3;

export const FriendDetailSkeleton = () => {
  return (
    <View className="gap-4">
      <View className="items-center gap-3 pt-2">
        <Skeleton width={192} height={192} circle />
        <Skeleton width={160} height={26} />
      </View>

      <View className="flex-row gap-2">
        {Array.from({ length: 4 }).map((_unused, index) => (
          <View key={index} className="flex-1">
            <Surface size="sm" className="items-center justify-center gap-1.5">
              <Skeleton width={22} height={22} circle />
              <Skeleton width={48} height={10} />
            </Surface>
          </View>
        ))}
      </View>

      <View className="flex-row gap-2">
        <Skeleton width="50%" height={44} className="flex-1 rounded-full" />
        <Skeleton width="50%" height={44} className="flex-1 rounded-full" />
      </View>

      <Surface>
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={14} />
          </View>
          <View className="flex-row justify-between">
            <Skeleton width={90} height={14} />
            <Skeleton width={70} height={14} />
          </View>
        </View>
      </Surface>

      <Skeleton width={100} height={20} />

      <View className="gap-2">
        {Array.from({ length: HISTORY_ROW_COUNT }).map((_unused, index) => (
          <Surface key={index} size="sm">
            <View className="flex-row items-center gap-3">
              <Skeleton width={48} height={48} />
              <Skeleton width="55%" height={16} className="flex-1" />
              <Skeleton width={64} height={20} className="rounded-full" />
            </View>
          </Surface>
        ))}
      </View>
    </View>
  );
};
