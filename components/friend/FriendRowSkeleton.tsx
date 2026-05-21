import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";

const ROW_COUNT = 6;

export const FriendRowSkeleton = () => {
  return (
    <View className="flex-row items-center gap-3 py-2 px-4">
      <Skeleton width={56} height={56} circle />
      <View className="flex-1 gap-1">
        <Skeleton width="55%" height={20} />
        <Skeleton width="35%" height={14} />
      </View>
    </View>
  );
};

export const FriendListSkeleton = () => {
  return (
    <View className="-mx-4">
      {Array.from({ length: ROW_COUNT }).map((_unused, index) => (
        <FriendRowSkeleton key={index} />
      ))}
    </View>
  );
};
