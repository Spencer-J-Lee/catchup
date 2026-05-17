import classNames from "classnames";
import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
}

export const Screen = ({
  children,
  scroll = false,
  className,
}: ScreenProps) => {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Container
        className={classNames("flex-1 px-4", className)}
        contentContainerClassName={scroll ? "py-4" : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};
