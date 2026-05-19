import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Field } from "@/components/ui/Field";
import { INPUT_SURFACE_CLASS } from "@/components/ui/InputSurface";
import { useThemedColors } from "@/hooks/use-themed-colors";

import { SearchModal } from "./SearchModal";
import { SelectedLocation } from "./SelectedLocation";

interface SearchablePickerProps {
  name: string;
  address: string;
  onChange: (value: { name: string; address: string }) => void;
}

export const SearchablePicker = ({
  name,
  address,
  onChange,
}: SearchablePickerProps) => {
  const colors = useThemedColors();
  const [modalVisible, setModalVisible] = useState(false);

  const clear = () => onChange({ name: "", address: "" });

  return (
    <>
      <Field label="Location">
        <Pressable onPress={() => setModalVisible(true)}>
          <View className={INPUT_SURFACE_CLASS}>
            {name || address ? (
              <SelectedLocation
                name={name}
                address={address}
                onClear={clear}
              />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="search" size={16} color={colors.fgSubtle} />
                <Text className="text-base text-subtle dark:text-subtle-dk">
                  Search for a place
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Field>

      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(result) => {
          onChange({ name: result.name, address: result.address });
          setModalVisible(false);
        }}
      />
    </>
  );
};
