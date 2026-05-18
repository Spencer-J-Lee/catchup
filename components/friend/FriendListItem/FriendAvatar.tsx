import { Image, Text, View } from "react-native";

import { initialsOf } from "@/lib/format";
import type { Friend } from "@/types/database";
import classNames from "classnames";

type AvatarSize = "sm" | "lg";

interface FriendAvatarProps {
  friend: Pick<Friend, "avatar_url" | "first_name" | "last_name">;
  size?: AvatarSize;
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: "h-14 w-14", text: "text-base" },
  lg: { container: "h-48 w-48", text: "text-7xl mt-2" },
};

export const FriendAvatar = ({ friend, size = "sm" }: FriendAvatarProps) => {
  const sizing = SIZE_CLASSES[size];
  const baseClassName = classNames(
    sizing.container,
    "rounded-full bg-raised dark:bg-raised-dk",
  );

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
      <Text
        className={classNames(
          "text-default dark:text-default-dk font-semibold leading-none",
          sizing.text,
        )}
      >
        {initialsOf(friend.first_name, friend.last_name)}
      </Text>
    </View>
  );
};
