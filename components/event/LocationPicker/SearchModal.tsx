import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  PlaceSearchResult,
  searchPlaces,
} from "@/modules/apple-place-search";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: PlaceSearchResult) => void;
}

export const SearchModal = ({ visible, onClose, onSelect }: SearchModalProps) => {
  const colors = useThemedColors();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Reset state whenever the modal opens.
  useEffect(() => {
    if (visible) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const next = await searchPlaces(trimmed);
        if (cancelled) return;
        setResults(next);
        setHasSearched(true);
      } catch {
        if (cancelled) return;
        setResults([]);
        setHasSearched(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, visible]);

  const trimmedQuery = query.trim();

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
          <View className={`flex-1 flex-row items-center gap-2 ${INPUT_SURFACE_CLASS}`}>
            <Ionicons name="search" size={16} color={colors.fgSubtle} />
            <TextInput
              ref={inputRef}
              className="flex-1 text-default dark:text-default-dk"
              placeholder="Search for a place"
              placeholderTextColor={colors.fgSubtle}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
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
          data={results}
          keyExtractor={(item, index) => `${item.name}-${item.address}-${index}`}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View className="h-px bg-border dark:bg-border-dk ml-12" />
          )}
          ListHeaderComponent={
            trimmedQuery.length > 0 ? (
              <ResultRow
                icon="create-outline"
                primary={`Use "${trimmedQuery}"`}
                secondary="Save just this name"
                onPress={() =>
                  onSelect({ name: trimmedQuery, address: "" })
                }
              />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              loading={loading}
              hasQuery={trimmedQuery.length > 0}
              hasSearched={hasSearched}
            />
          }
          renderItem={({ item }) => (
            <ResultRow
              icon="location-outline"
              primary={item.name || item.address}
              secondary={item.name ? item.address : undefined}
              onPress={() => onSelect(item)}
            />
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

interface ResultRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  primary: string;
  secondary?: string;
  onPress: () => void;
}

const ResultRow = ({ icon, primary, secondary, onPress }: ResultRowProps) => {
  const colors = useThemedColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-high dark:active:bg-high-dk"
    >
      <Ionicons name={icon} size={20} color={colors.fgMuted} />
      <View className="flex-1">
        <Text
          className="text-base text-default dark:text-default-dk"
          numberOfLines={1}
        >
          {primary}
        </Text>
        {secondary ? (
          <Text
            className="text-sm text-muted dark:text-muted-dk"
            numberOfLines={2}
          >
            {secondary}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

interface EmptyStateProps {
  loading: boolean;
  hasQuery: boolean;
  hasSearched: boolean;
}

const EmptyState = ({ loading, hasQuery, hasSearched }: EmptyStateProps) => {
  if (loading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator />
      </View>
    );
  }
  if (!hasQuery) {
    return (
      <View className="items-center py-8 px-6">
        <Text className="text-sm text-muted dark:text-muted-dk text-center">
          Start typing to search for a place
        </Text>
      </View>
    );
  }
  if (hasSearched) {
    return (
      <View className="items-center py-8 px-6">
        <Text className="text-sm text-muted dark:text-muted-dk text-center">
          No places found
        </Text>
      </View>
    );
  }
  return null;
};
