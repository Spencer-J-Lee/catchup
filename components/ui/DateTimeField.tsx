import DateTimePicker from "@react-native-community/datetimepicker";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Platform, Pressable, Text } from "react-native";

import { Field } from "@/components/ui/Field";
import { InputSurface } from "@/components/ui/InputSurface";
import { formatDateTime } from "@/lib/format";

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export const DateTimeField = ({
  label,
  value,
  onChange,
}: DateTimeFieldProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const { colorScheme } = useColorScheme();

  return (
    <Field label={label}>
      <Pressable onPress={() => setShowPicker(true)}>
        <InputSurface>
          <Text className="text-default dark:text-default-dk">
            {formatDateTime(value)}
          </Text>
        </InputSurface>
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={value}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          themeVariant={colorScheme === "dark" ? "dark" : "light"}
          onChange={(_, date) => {
            setShowPicker(Platform.OS === "ios");
            if (date) onChange(date);
          }}
        />
      ) : null}
    </Field>
  );
};
