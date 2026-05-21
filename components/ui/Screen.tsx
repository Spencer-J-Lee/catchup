// TODO: Review

import { useHeaderHeight } from "@react-navigation/elements";
import classNames from "classnames";
import { ReactNode, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  Edge,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  edges?: Edge[];
  footer?: ReactNode;
}

export const Screen = ({
  children,
  scroll = false,
  className,
  edges = ["top"],
  footer,
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const content = scroll ? (
    <ScrollView
      className={classNames("flex-1 px-4", className)}
      contentContainerClassName="py-4"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={classNames("flex-1 px-4", className)}>{children}</View>
  );

  if (!footer) {
    return (
      <SafeAreaView className="flex-1 bg-app dark:bg-app-dk" edges={edges}>
        {content}
      </SafeAreaView>
    );
  }

  const effectiveEdges = edges.filter((edge) => edge !== "bottom");

  return (
    <SafeAreaView
      className="flex-1 bg-app dark:bg-app-dk"
      edges={effectiveEdges}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
        className="flex-1"
      >
        {content}
        <View
          className="px-4 pt-4 bg-app border-t border-border dark:border-border-dk dark:bg-app-dk"
          style={{
            paddingBottom: keyboardVisible ? 16 : Math.max(insets.bottom, 16),
          }}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
