import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useThemedColors } from "@/hooks/use-themed-colors";

const TabsLayout = () => {
  const colors = useThemedColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.fgMuted,
        tabBarStyle: {
          backgroundColor: colors.app,
          borderTopColor: colors.border,
          paddingTop: 8,
        },
        tabBarLabelStyle: { display: "none" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
