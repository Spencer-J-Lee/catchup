import "react-native-reanimated";
import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/query-client";

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(loading: boolean, isAuthed: boolean) {
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
}

export default function RootLayout() {
  const { session, loading } = useAuth();
  useProtectedRoute(loading, !!session);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="friend/new"
              options={{ presentation: "modal", headerShown: true, title: "Add friend" }}
            />
            <Stack.Screen
              name="friend/[id]/index"
              options={{ headerShown: true, title: "" }}
            />
            <Stack.Screen
              name="friend/[id]/edit"
              options={{ headerShown: true, title: "Edit friend" }}
            />
            <Stack.Screen
              name="event/new"
              options={{ presentation: "modal", headerShown: true, title: "New catch-up" }}
            />
            <Stack.Screen
              name="event/[id]/index"
              options={{ headerShown: true, title: "Catch-up" }}
            />
            <Stack.Screen
              name="event/[id]/edit"
              options={{ headerShown: true, title: "Edit catch-up" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
