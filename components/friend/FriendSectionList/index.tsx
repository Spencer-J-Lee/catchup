import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { FriendListItem } from "@/components/friend/FriendListItem";
import type { FriendSection } from "@/lib/friend-sections";

import { SectionList, View } from "react-native";
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
    <SectionList
      sections={sections}
      keyExtractor={(row) => row.friend.id}
      renderItem={({ item }) => (
        <FriendListItem
          friend={item.friend}
          action={item.action}
          whenAt={item.whenAt}
          scheduledEventId={item.scheduledEventId}
          missedAt={item.missedAt}
          isDue={item.isDue}
        />
      )}
      renderSectionHeader={({ section }) => (
        <SectionHeader state={section.state} title={section.title} />
      )}
      renderSectionFooter={() => <View className="h-5" />}
      stickySectionHeadersEnabled
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
      keyboardShouldPersistTaps="handled"
      className="-mx-4"
    />
  );
};
