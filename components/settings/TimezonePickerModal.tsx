import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { INPUT_SURFACE_CLASS } from "@/components/ui/InputSurface";
import { useThemedColors } from "@/hooks/use-themed-colors";

const FALLBACK_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const getSupportedTimezones = (): string[] => {
  try {
    const list = (
      Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {
    // fall through
  }

  return FALLBACK_TIMEZONES;
};

interface TimezonePickerModalProps {
  visible: boolean;
  current: string;
  onClose: () => void;
  onSelect: (timezone: string) => void;
}

export const TimezonePickerModal = ({
  visible,
  current,
  onClose,
  onSelect,
}: TimezonePickerModalProps) => {
  const colors = useThemedColors();
  const [query, setQuery] = useState("");

  const allTimezones = useMemo(() => getSupportedTimezones(), []);

  useEffect(() => {
    if (visible) {
      setQuery("");
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allTimezones;

    return allTimezones.filter((tz) => tz.toLowerCase().includes(trimmed));
  }, [allTimezones, query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1 bg-app dark:bg-app-dk"
        edges={["top", "left", "right"]}
      >
        <View className="flex-row items-center gap-3 px-4 py-3">
          <View
            className={`flex-1 flex-row items-center gap-2 ${INPUT_SURFACE_CLASS}`}
          >
            <Ionicons name="search" size={16} color={colors.fgSubtle} />
            <TextInput
              className="flex-1 text-default dark:text-default-dk"
              placeholder="Search time zones"
              placeholderTextColor={colors.fgSubtle}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />

            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={8}
                accessibilityLabel="Clear search"
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.fgSubtle}
                />
              </Pressable>
            ) : null}
          </View>

          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-base text-brand dark:text-brand-dk">
              Cancel
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(timezone) => timezone}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View className="h-px bg-border dark:bg-border-dk ml-4" />
          )}
          ListEmptyComponent={
            <View className="items-center py-8 px-6">
              <Text className="text-sm text-muted dark:text-muted-dk text-center">
                No matching time zones
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TimezoneRow
              timezone={item}
              isSelected={item === current}
              onPress={() => onSelect(item)}
            />
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

interface TimezoneRowProps {
  timezone: string;
  isSelected: boolean;
  onPress: () => void;
}

const TimezoneRow = ({ timezone, isSelected, onPress }: TimezoneRowProps) => {
  const colors = useThemedColors();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3 active:bg-high dark:active:bg-high-dk"
    >
      <Text className="text-base text-default dark:text-default-dk">
        {timezone}
      </Text>
      {isSelected ? (
        <Ionicons name="checkmark" size={20} color={colors.brand} />
      ) : null}
    </Pressable>
  );
};
