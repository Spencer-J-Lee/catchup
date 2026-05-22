import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { Surface } from "@/components/ui/Surface";

const HISTORY_ROW_COUNT = 3;

export const FriendDetailSkeleton = () => {
  return (
    <View className="gap-4">
      <View className="items-center gap-3 pt-2">
        <Skeleton width={170} height={170} circle />
        <Skeleton width={180} height={28} />
      </View>

      <View className="flex-row gap-2">
        {Array.from({ length: 4 }).map((_unused, index) => (
          <View key={index} className="flex-1">
            <Surface size="sm" className="items-center justify-center gap-1">
              <Skeleton width={22} height={22} circle />
              <Skeleton width={48} height={12} />
            </Surface>
          </View>
        ))}
      </View>

      <View className="flex-row gap-2">
        <Skeleton width="50%" height={48} className="flex-1 rounded-full" />
        <Skeleton width="50%" height={48} className="flex-1 rounded-full" />
      </View>

      <Surface>
        <View className="gap-4">
          <View className="flex-row justify-between items-center">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={18} />
          </View>
          <View className="flex-row justify-between items-center">
            <Skeleton width={90} height={16} />
            <Skeleton width={70} height={18} />
          </View>
        </View>
      </Surface>

      <Skeleton width={100} height={22} />

      <View className="gap-2">
        {Array.from({ length: HISTORY_ROW_COUNT }).map((_unused, index) => (
          <Surface key={index} size="sm">
            <View className="flex-row items-center gap-3">
              <Skeleton width={48} height={48} />
              <Skeleton width="55%" height={18} className="flex-1" />
              <Skeleton width={72} height={21} className="rounded-full" />
            </View>
          </Surface>
        ))}
      </View>
    </View>
  );
};
