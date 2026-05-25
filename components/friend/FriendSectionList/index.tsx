import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";

import { FriendListItem } from "@/components/friend/FriendListItem";
import type { FriendSection } from "@/lib/friend-sections";

import { View } from "react-native";
import { SectionHeader } from "./SectionHeader";

const FRIEND_LIST_ANIMATION_DURATION = 300;

interface FriendSectionListProps {
  sections: FriendSection[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const FriendSectionList = ({
  sections,
  isRefreshing,
  onRefresh,
}: FriendSectionListProps) => {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <Animated.FlatList
      data={sections}
      keyExtractor={(section) =>
        section.kind === "header" ? section.state : section.row.friend.id
      }
      renderItem={({ item, index }) => (
        <Animated.View
          exiting={FadeOut.duration(FRIEND_LIST_ANIMATION_DURATION)}
        >
          {item.kind === "header" ? (
            <>
              {index === 0 ? null : (
                <View className="h-5 bg-app dark:bg-app-dk" />
              )}
              <SectionHeader state={item.state} title={item.title} />
            </>
          ) : (
            <FriendListItem
              friend={item.row.friend}
              action={item.row.action}
              whenAt={item.row.whenAt}
              scheduledEventId={item.row.scheduledEventId}
              missedAt={item.row.missedAt}
              isDue={item.row.isDue}
            />
          )}
        </Animated.View>
      )}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
      keyboardShouldPersistTaps="handled"
      itemLayoutAnimation={LinearTransition.duration(
        FRIEND_LIST_ANIMATION_DURATION,
      )}
      className="-mx-4"
    />
  );
};
