import "@/lib/theme-store";
import "react-native-reanimated";
import "../global.css";

import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import type { AppStateStatus } from "react-native";
import { AppState, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

import { TimezoneBootstrap } from "@/components/TimezoneBootstrap";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { queryClient } from "@/lib/query-client";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

const onAppStateChange = (status: AppStateStatus) => {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");

    // Drive Supabase token auto-refresh from foreground state. The built-in
    // autoRefreshToken timer is unreliable while the app is backgrounded, so
    // start it on foreground and stop it otherwise to avoid stale sessions.
    if (status === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  }
};

const useReactQueryFocusManager = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);
};

const useProtectedRoute = (loading: boolean, isAuthed: boolean) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthed && !inAuthGroup) {
      router.replace(ROUTES.auth.login);
    } else if (isAuthed && inAuthGroup) {
      router.replace(ROUTES.home);
    }
  }, [loading, isAuthed, segments, router]);
};

const RootLayoutInner = () => {
  const { session, loading } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = useThemedColors();
  useReactQueryFocusManager();
  useProtectedRoute(loading, !!session);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  const stackHeaderOptions = {
    headerStyle: { backgroundColor: colors.app },
    headerTintColor: colors.fgDefault,
    headerTitleStyle: { color: colors.fgDefault },
    headerBackTitle: "Back",
    contentStyle: { backgroundColor: colors.app },
  } as const;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.app }}>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            {session ? <TimezoneBootstrap /> : null}
            <Stack
              screenOptions={{ headerShown: false, ...stackHeaderOptions }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="friend/pick-contact"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Add friend",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="friend/new"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Add friend",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="friend/[id]/index"
                options={{
                  headerShown: true,
                  title: "",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="friend/[id]/edit"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: "fitToContents",
                  sheetGrabberVisible: true,
                  headerShown: true,
                  title: "Frequency",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="event/new"
                options={{
                  headerShown: true,
                  title: "New catch-up",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="event/[id]/index"
                options={{
                  headerShown: true,
                  title: "Catch-up",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="event/[id]/edit"
                options={{
                  headerShown: true,
                  title: "Edit catch-up",
                  ...stackHeaderOptions,
                }}
              />
              <Stack.Screen
                name="event/[id]/follow-up"
                options={{
                  presentation: "formSheet",
                  sheetAllowedDetents: "fitToContents",
                  sheetGrabberVisible: true,
                  headerShown: true,
                  title: "Follow up",
                  ...stackHeaderOptions,
                }}
              />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </QueryClientProvider>
        </SafeAreaProvider>
        <Toaster
          theme={colorScheme === "dark" ? "dark" : "light"}
          toastOptions={{
            style: {
              backgroundColor: colors.raised,
              borderColor: colors.border,
              borderWidth: 1,
            },
            titleStyle: { color: colors.fgDefault },
            descriptionStyle: { color: colors.fgMuted },
          }}
        />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

const RootLayout = () => (
  <AuthProvider>
    <RootLayoutInner />
  </AuthProvider>
);

export default RootLayout;
