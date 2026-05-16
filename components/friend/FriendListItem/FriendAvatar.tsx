import { Image, Text, View } from "react-native";

import type { FriendWithStatus } from "@/hooks/use-friends";
import { initialsOf } from "@/lib/format";
import classNames from "classnames";

interface FriendAvatarProps {
  friend: FriendWithStatus;
}

export const FriendAvatar = ({ friend }: FriendAvatarProps) => {
  const baseClassName = "h-14 w-14 rounded-full bg-surface-elevated";

  if (friend.avatar_url) {
    return (
      <Image
        source={{ uri: friend.avatar_url }}
        className={baseClassName}
        resizeMode="cover"
      />
    );
  }

  return (
    <View className={classNames(baseClassName, "items-center justify-center")}>
      <Text className="text-fg text-base font-semibold">
        {initialsOf(friend.first_name, friend.last_name)}
      </Text>
    </View>
  );
};
