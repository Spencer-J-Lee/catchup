import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { useThemedColors } from "@/hooks/use-themed-colors";

type EmptyStateCta =
  | { label: string; href: Href; onPress?: never }
  | { label: string; onPress: () => void; href?: never };

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  cta?: EmptyStateCta;
}

export const EmptyState = ({
  icon,
  title,
  description,
  cta,
}: EmptyStateProps) => {
  const colors = useThemedColors();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-raised dark:bg-raised-dk">
        <Ionicons name={icon} size={36} color={colors.brand} />
      </View>

      <Text className="mt-5 text-center text-xl font-semibold text-default dark:text-default-dk">
        {title}
      </Text>

      {description ? (
        <Text className="mt-2 text-center text-muted dark:text-muted-dk">
          {description}
        </Text>
      ) : null}

      {cta ? (
        cta.href ? (
          <Link href={cta.href} asChild>
            <Button className="mt-6 px-6">{cta.label}</Button>
          </Link>
        ) : (
          <Button className="mt-6 px-6" onPress={cta.onPress}>
            {cta.label}
          </Button>
        )
      ) : null}
    </View>
  );
};
