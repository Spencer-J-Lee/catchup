import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { Link } from "expo-router";
import { useRef } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { useDeleteFriend, type FriendWithStatus } from "@/hooks/use-friends";
import { colors } from "@/lib/colors";
import { fullName } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

import { FriendActionButton } from "./FriendActionButton";
import { FriendAvatar } from "./FriendAvatar";
import { getFriendSubLabelData } from "./friendSubLabel";
import type { FriendItemAction } from "./types";

export type { FriendItemAction };

interface FriendListItemProps {
  friend: FriendWithStatus;
  action: FriendItemAction;
  scheduledAt?: string | null;
  scheduledEventId?: string | null;
  /** When set and `action === "schedule"`, render a "Missed X ago" hint —
   * signals the missed→reaching-out auto-flow. */
  missedAt?: string | null;
  isDue?: boolean;
}

export const FriendListItem = ({
  friend,
  action,
  scheduledAt,
  scheduledEventId,
  missedAt,
  isDue,
}: FriendListItemProps) => {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const del = useDeleteFriend();

  const onDeletePress = () => {
    Alert.alert(
      `Delete ${fullName(friend)}?`,
      "This will also delete all catch-up history.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            del.mutate(friend.id);
          },
        },
      ],
    );
  };

  const renderRightActions = () => {
    return (
      <Pressable
        onPress={onDeletePress}
        className="w-20 bg-danger-600 active:bg-danger-700 items-center justify-center"
      >
        <Ionicons name="trash" size={22} color={colors.fg.DEFAULT} />
      </Pressable>
    );
  };

  const subLabelData = getFriendSubLabelData({
    friend,
    action,
    scheduledAt,
    missedAt,
    isDue,
  });

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      friction={2}
      overshootRight={false}
    >
      <Link href={ROUTES.friend.detail(friend.id)} asChild>
        <Pressable className="flex-row items-center gap-3 py-2 px-4 bg-surface active:opacity-70">
          <FriendAvatar friend={friend} />

          <View className="flex-1 gap-0.5">
            <Text className="text-lg font-semibold text-fg">
              {fullName(friend)}
            </Text>
            <Text className={classNames("text-sm", subLabelData.className)}>
              {subLabelData.label}
            </Text>
          </View>

          <FriendActionButton
            friend={friend}
            action={action}
            scheduledEventId={scheduledEventId}
          />
        </Pressable>
      </Link>
    </ReanimatedSwipeable>
  );
};
