import { useColorScheme } from "nativewind";

import { darkColors, lightColors } from "@/lib/colors";

export const useThemedColors = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? darkColors : lightColors;
};
