import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import { PreReminderSection } from "@/components/settings/PreReminderSection";
import { SeedDataSection } from "@/components/settings/SeedDataSection";
import { ThemeSection } from "@/components/settings/ThemeSection";
import { TimezoneSection } from "@/components/settings/TimezoneSection";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <Screen scroll>
      <View className="gap-6" style={{ paddingBottom: tabBarHeight }}>
        <Text className="text-2xl font-bold text-default dark:text-default-dk">
          Settings
        </Text>

        <View className="gap-1">
          <Text className="text-sm text-muted dark:text-muted-dk">
            Signed in as
          </Text>
          <Text className="text-base text-default dark:text-default-dk">
            {user?.email ?? "—"}
          </Text>
        </View>

        <ThemeSection />

        <TimezoneSection />

        <PreReminderSection />

        <View className="mt-4">
          <SeedDataSection />
        </View>

        <Button variant="destructive" onPress={() => signOut()}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
};

export default SettingsScreen;
