// TODO: Review
import {
  differenceInCalendarDays,
  format,
  formatDistanceStrict,
  formatDistanceToNowStrict,
  startOfDay,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

import type { EventStatus, FrequencyUnit, Medium } from "@/types/database";

const toDate = (date: Date | string): Date =>
  typeof date === "string" ? new Date(date) : date;

export const formatDate = (date: Date | string, tz?: string): string => {
  const parsed = toDate(date);
  return tz
    ? formatInTimeZone(parsed, tz, "MMM d, yyyy")
    : format(parsed, "MMM d, yyyy");
};

export const formatDateTime = (date: Date | string, tz?: string): string => {
  const parsed = toDate(date);
  return tz
    ? formatInTimeZone(parsed, tz, "MMM d, yyyy 'at' h:mm a")
    : format(parsed, "MMM d, yyyy 'at' h:mm a");
};

export const formatRelative = (date: Date | string, tz?: string): string => {
  const parsed = toDate(date);
  const now = new Date();

  const parsedForCalendar = tz ? toZonedTime(parsed, tz) : parsed;
  const nowForCalendar = tz ? toZonedTime(now, tz) : now;

  if (differenceInCalendarDays(parsedForCalendar, nowForCalendar) === 0) {
    return formatDistanceToNowStrict(parsed, { addSuffix: true });
  }

  return formatDistanceStrict(
    startOfDay(parsedForCalendar),
    startOfDay(nowForCalendar),
    { addSuffix: true },
  );
};

export const formatOverdueDays = (
  dueAt: Date | string,
  tz?: string,
): string => {
  const parsed = toDate(dueAt);
  const now = new Date();
  const parsedForCalendar = tz ? toZonedTime(parsed, tz) : parsed;
  const nowForCalendar = tz ? toZonedTime(now, tz) : now;
  const days = differenceInCalendarDays(nowForCalendar, parsedForCalendar);
  if (days <= 0) return "Reconnect today";
  return days === 1 ? "1 day past due" : `${days} days past due`;
};

export const formatTimeOfDay = (date: Date | string, tz?: string): string => {
  const parsed = toDate(date);
  return tz
    ? formatInTimeZone(parsed, tz, "h:mm a")
    : format(parsed, "h:mm a");
};

export const formatLocalDateKey = (
  date: Date | string,
  tz?: string,
): string => {
  const parsed = toDate(date);
  return tz
    ? formatInTimeZone(parsed, tz, "yyyy-MM-dd")
    : format(parsed, "yyyy-MM-dd");
};

export const fullName = (parts: {
  first_name: string;
  last_name?: string | null;
}): string => {
  const last = parts.last_name?.trim();
  return last ? `${parts.first_name} ${last}` : parts.first_name;
};

export const initialsOf = (
  firstName: string,
  lastName?: string | null,
): string => {
  const first = firstName.trim();
  const last = lastName?.trim() ?? "";
  if (first && last) {
    return (first[0]! + last[0]!).toUpperCase();
  }
  if (first) {
    return first.slice(0, 2).toUpperCase();
  }
  return "?";
};

export const formatStatus = (status: EventStatus): string => {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
    case "cancelled":
      return "Cancelled";
  }
};

export const formatFrequency = (
  amount: number | null | undefined,
  unit: FrequencyUnit | null | undefined,
): string => {
  if (!amount || !unit) return "Not set";

  if (amount === 1) {
    switch (unit) {
      case "days":
        return "Daily";
      case "weeks":
        return "Weekly";
      case "months":
        return "Monthly";
    }
  }

  return `Every ${amount} ${unit}`;
};

export const formatMedium = (medium: Medium | null | undefined): string => {
  switch (medium) {
    case "text":
      return "Text";
    case "call":
      return "Call";
    case "video":
      return "Video";
    case "in_person":
      return "In person";
    case "email":
      return "Email";
    default:
      return "";
  }
};
