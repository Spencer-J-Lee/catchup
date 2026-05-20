import { useEffect, useRef } from "react";

import {
  detectDeviceTimezone,
  useProfile,
  useUpdateProfile,
} from "@/hooks/use-profile";

export const TimezoneBootstrap = () => {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!profile || ranRef.current) return;
    ranRef.current = true;

    if (profile.timezone !== null) return;

    const detected = detectDeviceTimezone();
    if (!detected) return;

    update.mutate({ timezone: detected });
  }, [profile, update]);

  return null;
};
