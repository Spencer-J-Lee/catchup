import "react-native-reanimated";
import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/lib/colors";
import { queryClient } from "@/lib/query-client";

SplashScreen.preventAutoHideAsync();

const useProtectedRoute = (loading: boolean, isAuthed: boolean) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthed && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthed && inAuthGroup) {
      router.replace("/");
    }
  }, [loading, isAuthed, segments, router]);
};

const STACK_HEADER_OPTIONS = {
  headerStyle: { backgroundColor: colors.surface.DEFAULT },
  headerTintColor: colors.fg.DEFAULT,
  headerTitleStyle: { color: colors.fg.DEFAULT },
  headerBackTitle: "Back",
  contentStyle: { backgroundColor: colors.surface.DEFAULT },
} as const;

const RootLayout = () => {
  const { session, loading } = useAuth();
  useProtectedRoute(loading, !!session);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{ headerShown: false, ...STACK_HEADER_OPTIONS }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="friend/pick-contact"
              options={{
                presentation: "modal",
                headerShown: true,
                title: "Add friend",
                ...STACK_HEADER_OPTIONS,
              }}
            />
            <Stack.Screen
              name="friend/new"
              options={{
                headerShown: true,
                title: "Add friend",
                ...STACK_HEADER_OPTIONS,
              }}
            />
            <Stack.Screen
              name="friend/[id]/index"
              options={{
                headerShown: true,
                title: "",
                ...STACK_HEADER_OPTIONS,
              }}
            />
            <Stack.Screen
              name="friend/[id]/edit"
              options={{
                headerShown: true,
                title: "Edit friend",
                ...STACK_HEADER_OPTIONS,
              }}
            />
            <Stack.Screen
              name="event/new"
              options={{
                presentation: "modal",
                headerShown: true,
                title: "New catch-up",
                ...STACK_HEADER_OPTIONS,
              }}
            />
            <Stack.Screen
              name="event/[id]/index"
              options={{
                headerShown: true,
                title: "Catch-up",
                ...STACK_HEADER_OPTIONS,
              }}
            />
            <Stack.Screen
              name="event/[id]/edit"
              options={{
                headerShown: true,
                title: "Edit catch-up",
                ...STACK_HEADER_OPTIONS,
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
