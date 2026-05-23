// TODO: BEEG REVIEW 1

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMemo } from "react";
import { FlatList, View } from "react-native";

import { FriendListItem } from "@/components/friend/FriendListItem";
import type { FriendSection } from "@/lib/friend-sections";

import { SectionHeader } from "./SectionHeader";

interface FriendSectionListProps {
  sections: FriendSection[];
  isRefetching: boolean;
  onRefresh: () => void;
}

export const FriendSectionList = ({
  sections,
  isRefetching,
  onRefresh,
}: FriendSectionListProps) => {
  const tabBarHeight = useBottomTabBarHeight();

  const stickyHeaderIndices = useMemo(
    () =>
      sections.reduce<number[]>((indices, section, index) => {
        if (section.kind === "header") indices.push(index);
        return indices;
      }, []),
    [sections],
  );

  return (
    <FlatList
      className="-mx-4"
      data={sections}
      keyExtractor={(section, index) =>
        section.kind === "header"
          ? `h-${section.title}-${index}`
          : `f-${section.row.friend.id}`
      }
      ItemSeparatorComponent={({
        leadingItem,
      }: {
        leadingItem: FriendSection;
      }) => (
        <View className={leadingItem?.kind === "header" ? "h-0" : "h-1"} />
      )}
      renderItem={({ item, index }) =>
        item.kind === "header" ? (
          <SectionHeader state={item.state} title={item.title} />
        ) : (
          <>
            <FriendListItem
              friend={item.row.friend}
              action={item.row.action}
              whenAt={item.row.whenAt}
              scheduledEventId={item.row.scheduledEventId}
              missedAt={item.row.missedAt}
              isDue={item.row.isDue}
            />
            {sections[index + 1]?.kind === "header" ? (
              <View className="h-4" />
            ) : null}
          </>
        )
      }
      refreshing={isRefetching}
      onRefresh={onRefresh}
      stickyHeaderIndices={stickyHeaderIndices}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
      keyboardShouldPersistTaps="handled"
    />
  );
};
