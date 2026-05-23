import { Text } from "react-native";

import { SettingsSection } from "@/components/settings/SettingsSection";
import { ChipRow } from "@/components/ui/ChipRow";
import { Pill } from "@/components/ui/Pill";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { toast, toastMutationError } from "@/lib/toast";

interface PreReminderOption {
  value: number;
  label: string;
}

const PRE_REMINDER_OPTIONS: PreReminderOption[] = [
  { value: 0, label: "Off" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hr" },
  { value: 180, label: "3 hr" },
  { value: 1440, label: "1 day" },
];

export const PreReminderSection = () => {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const currentValue = profile?.default_pre_reminder_minutes ?? null;

  const onSelect = (value: number) => {
    if (value === currentValue) return;
    update.mutate(
      { default_pre_reminder_minutes: value },
      {
        onSuccess: () => toast.success("Default reminder updated"),
        onError: (error) => toastMutationError(error, "Couldn't save reminder"),
      },
    );
  };

  return (
    <SettingsSection label="Default reminder">
      <ChipRow>
        {PRE_REMINDER_OPTIONS.map((option) => (
          <Pill
            key={option.value}
            variant={currentValue === option.value ? "primary" : "secondary"}
            label={option.label}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </ChipRow>
      <Text className="text-xs text-muted dark:text-muted-dk">
        Used as the default lead time for new scheduled catch-ups.
      </Text>
    </SettingsSection>
  );
};
