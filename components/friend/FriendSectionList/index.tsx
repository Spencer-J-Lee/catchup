import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { FriendListItem } from "@/components/friend/FriendListItem";
import type { FriendSection } from "@/lib/friend-sections";

import { FlatList, View } from "react-native";
import { SectionHeader } from "./SectionHeader";

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
    <FlatList
      data={sections}
      keyExtractor={(section) =>
        section.kind === "header" ? section.state : section.row.friend.id
      }
      renderItem={({ item, index }) =>
        item.kind === "header" ? (
          <>
            {index === 0 ? null : <View className="h-5" />}
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
        )
      }
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
      keyboardShouldPersistTaps="handled"
      className="-mx-4"
    />
  );
};
