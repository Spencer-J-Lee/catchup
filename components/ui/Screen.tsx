import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
}

export function Screen({ children, scroll = false, className }: ScreenProps) {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Container
        className={`flex-1 px-4 ${className ?? ""}`}
        contentContainerClassName={scroll ? "py-4" : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
