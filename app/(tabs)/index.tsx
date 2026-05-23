// TODO: BEEG REVIEW 1

import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { FriendSectionList } from "@/components/friend/FriendSectionList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useMissedEvents, useScheduledEvents } from "@/hooks/use-events";
import { useFriends } from "@/hooks/use-friends";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { buildFriendSections } from "@/lib/friend-sections";
import { ROUTES } from "@/lib/routes";

const FriendsScreen = () => {
  const colors = useThemedColors();
  const tabBarHeight = useBottomTabBarHeight();
  const { data, isLoading, error, refetch, isRefetching } = useFriends();
  const { data: scheduledEvents } = useScheduledEvents();
  const { data: missedEvents } = useMissedEvents();
  const [search, setSearch] = useState("");

  const sections = useMemo(
    () =>
      buildFriendSections({
        friends: data,
        scheduledEvents,
        missedEvents,
        search,
      }),
    [data, scheduledEvents, missedEvents, search],
  );

  const hasFriends = !!data && data.length > 0;

  const renderBody = () => {
    if (isLoading && !data) {
      return (
        <View
          className="flex-1 items-center justify-center"
          style={{ paddingBottom: tabBarHeight + 24 }}
        >
          <ActivityIndicator color={colors.fgDefault} />
        </View>
      );
    }

    if (error) {
      return (
        <Text className="text-danger dark:text-danger-dk">
          Failed to load friends: {(error as Error).message}
        </Text>
      );
    }

    if (!hasFriends) {
      return (
        <View className="flex-1" style={{ paddingBottom: tabBarHeight }}>
          <EmptyState
            icon="people-outline"
            title="No friends yet"
            description="Add a friend to start tracking your catch-ups."
            cta={{
              label: "Add your first friend",
              href: ROUTES.friend.pickContact,
            }}
          />
        </View>
      );
    }

    if (sections.length === 0) {
      return (
        <View className="flex-1" style={{ paddingBottom: tabBarHeight }}>
          <Text className="text-muted dark:text-muted-dk">
            {`No friends match “${search.trim()}”`}
          </Text>
        </View>
      );
    }

    return (
      <FriendSectionList
        sections={sections}
        isRefetching={isRefetching}
        onRefresh={refetch}
      />
    );
  };

  return (
    <Screen>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-default dark:text-default-dk">
          Catchup
        </Text>
        <Link href={ROUTES.friend.pickContact} asChild>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-raised active:bg-high dark:bg-raised-dk dark:active:bg-high-dk">
            <Ionicons name="add" size={22} color={colors.fgDefault} />
          </Pressable>
        </Link>
      </View>

      {hasFriends ? (
        <View className="mb-4">
          <Input
            placeholder="Search friends"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      ) : null}

      {renderBody()}
    </Screen>
  );
};

export default FriendsScreen;
