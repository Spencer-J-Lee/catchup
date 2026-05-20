import { useState } from "react";

import { SettingsSection } from "@/components/settings/SettingsSection";
import { TimezonePickerModal } from "@/components/settings/TimezonePickerModal";
import { IconActionRow } from "@/components/ui/IconActionRow";
import {
  detectDeviceTimezone,
  useProfile,
  useUpdateProfile,
} from "@/hooks/use-profile";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { toast, toastMutationError } from "@/lib/toast";

export const TimezoneSection = () => {
  const colors = useThemedColors();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [pickerOpen, setPickerOpen] = useState(false);

  const currentTimezone =
    profile?.timezone ?? detectDeviceTimezone() ?? "UTC";

  const onSelect = (timezone: string) => {
    update.mutate(
      { timezone },
      {
        onSuccess: () => {
          toast.success("Time zone updated");
          setPickerOpen(false);
        },
        onError: (error) => {
          toastMutationError(error, "Couldn't save time zone");
        },
      },
    );
  };

  return (
    <SettingsSection label="Time zone">
      <IconActionRow
        icon="time-outline"
        iconColor={colors.brand}
        label={currentTimezone}
        subtitle={
          profile && profile.timezone === null
            ? "Detecting from device…"
            : "Tap to change"
        }
        onPress={() => setPickerOpen(true)}
        disabled={update.isPending}
      />
      <TimezonePickerModal
        visible={pickerOpen}
        current={currentTimezone}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelect}
      />
    </SettingsSection>
  );
};
