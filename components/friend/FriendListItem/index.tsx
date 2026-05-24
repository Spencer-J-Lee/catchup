import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { Link } from "expo-router";
import { useRef } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { FadeOutUp } from "react-native-reanimated";

import { useFormatters } from "@/hooks/use-formatters";
import { useDeleteFriend, type FriendWithStatus } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { fullName } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

import { FRIEND_LIST_ANIMATION_DURATION } from "../constants";
import { FriendActionButton } from "./FriendActionButton";
import { FriendAvatar } from "./FriendAvatar";
import { getFriendSubLabelData } from "./friendSubLabel";
import type { FriendItemAction } from "./types";

export type { FriendItemAction };

interface FriendListItemProps {
  friend: FriendWithStatus;
  action?: FriendItemAction | null;
  whenAt?: string | null;
  scheduledEventId?: string | null;
  missedAt?: string | null;
  isDue?: boolean;
}

export const FriendListItem = ({
  friend,
  action,
  whenAt,
  scheduledEventId,
  missedAt,
  isDue,
}: FriendListItemProps) => {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const deleteFriend = useDeleteFriend();
  const colors = useThemedColors();
  const { formatRelative, formatOverdueDays } = useFormatters();

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
            deleteFriend.mutate(friend.id);
          },
        },
      ],
    );
  };

  const renderRightActions = () => {
    return (
      <Pressable
        onPress={onDeletePress}
        className="w-20 items-center justify-center bg-danger active:bg-danger-hov dark:bg-danger-dk dark:active:bg-danger-hov-dk"
      >
        <Ionicons name="trash" size={22} color={colors.dangerFg} />
      </Pressable>
    );
  };

  const subLabelData = getFriendSubLabelData({
    friend,
    action,
    whenAt,
    missedAt,
    isDue,
    formatRelative,
    formatOverdueDays,
  });

  return (
    <Animated.View exiting={FadeOutUp.duration(FRIEND_LIST_ANIMATION_DURATION)}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={30}
        friction={2}
        overshootRight
      >
        <Link href={ROUTES.friend.detail(friend.id)} asChild>
          <Pressable className="flex-row items-center gap-3 bg-app px-4 py-2 dark:bg-app-dk">
            <FriendAvatar friend={friend} />

            <View className="flex-1 gap-0.5">
              <Text className="text-lg font-semibold text-default dark:text-default-dk">
                {fullName(friend)}
              </Text>
              <Text className={classNames("text-sm", subLabelData.className)}>
                {subLabelData.label}
              </Text>
            </View>

            {action ? (
              <FriendActionButton
                friend={friend}
                action={action}
                scheduledEventId={scheduledEventId}
              />
            ) : null}
          </Pressable>
        </Link>
      </ReanimatedSwipeable>
    </Animated.View>
  );
};
