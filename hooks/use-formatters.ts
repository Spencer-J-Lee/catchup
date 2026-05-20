import { formatInTimeZone } from "date-fns-tz";
import { useMemo } from "react";

import { useUserTimezone } from "@/hooks/use-profile";
import {
  formatDate,
  formatDateTime,
  formatLocalDateKey,
  formatOverdueDays,
  formatRelative,
  formatTimeOfDay,
} from "@/lib/format";

export const useFormatters = () => {
  const timezone = useUserTimezone();

  return useMemo(
    () => ({
      timezone,
      formatDate: (date: Date | string) => formatDate(date, timezone),
      formatDateTime: (date: Date | string) => formatDateTime(date, timezone),
      formatRelative: (date: Date | string) => formatRelative(date, timezone),
      formatOverdueDays: (date: Date | string) =>
        formatOverdueDays(date, timezone),
      formatTimeOfDay: (date: Date | string) =>
        formatTimeOfDay(date, timezone),
      formatLocalDateKey: (date: Date | string) =>
        formatLocalDateKey(date, timezone),
      formatPattern: (date: Date | string, pattern: string) =>
        formatInTimeZone(
          typeof date === "string" ? new Date(date) : date,
          timezone,
          pattern,
        ),
    }),
    [timezone],
  );
};
