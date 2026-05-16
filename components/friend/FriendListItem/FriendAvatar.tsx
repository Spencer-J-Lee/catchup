import { Image, Text, View } from "react-native";

import { initialsOf } from "@/lib/format";
import type { FriendWithStatus } from "@/hooks/use-friends";

interface FriendAvatarProps {
  friend: FriendWithStatus;
}

export const FriendAvatar = ({ friend }: FriendAvatarProps) => {
  if (friend.avatar_url) {
    return (
      <Image
        source={{ uri: friend.avatar_url }}
        className="h-14 w-14 rounded-full bg-surface-elevated"
        resizeMode="cover"
      />
    );
  }

  return (
    <View className="h-14 w-14 rounded-full bg-surface-elevated items-center justify-center">
      <Text className="text-fg text-base font-semibold">
        {initialsOf(friend.first_name, friend.last_name)}
      </Text>
    </View>
  );
};
