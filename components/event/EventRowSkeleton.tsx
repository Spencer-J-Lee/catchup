import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";
import { Surface } from "@/components/ui/Surface";

const ROW_COUNT = 3;

export const EventRowSkeleton = () => {
  return (
    <Surface size="sm" className="flex-row items-center gap-3 overflow-hidden">
      <View className="absolute left-0 top-0 bottom-0 w-2 bg-high dark:bg-high-dk" />
      <View className="w-14 items-end gap-1">
        <Skeleton width={32} height={16} />
        <Skeleton width={20} height={10} />
      </View>
      <Skeleton width={56} height={56} circle />
      <View className="flex-1 gap-1.5">
        <Skeleton width="60%" height={16} />
        <Skeleton width="35%" height={12} />
      </View>
    </Surface>
  );
};

interface EventListSkeletonProps {
  paddingBottom?: number;
}

export const EventListSkeleton = ({
  paddingBottom,
}: EventListSkeletonProps) => {
  return (
    <View
      className="gap-2.5"
      style={{
        paddingHorizontal: 14,
        paddingBottom,
      }}
    >
      {Array.from({ length: ROW_COUNT }).map((_unused, index) => (
        <EventRowSkeleton key={index} />
      ))}
    </View>
  );
};
