import classNames from "classnames";
import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  edges?: Edge[];
}

export const Screen = ({
  children,
  scroll = false,
  className,
  edges = ["top"],
}: ScreenProps) => {
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={edges}>
      <Container
        className={classNames("flex-1 px-4", className)}
        contentContainerClassName={scroll ? "py-4" : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};
