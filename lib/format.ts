// TODO: Review
import {
  differenceInCalendarDays,
  format,
  formatDistanceStrict,
  formatDistanceToNowStrict,
  startOfDay,
} from "date-fns";

import type { EventStatus, FrequencyUnit, Medium } from "@/types/database";

export const formatDate = (date: Date | string): string => {
  return format(
    typeof date === "string" ? new Date(date) : date,
    "MMM d, yyyy",
  );
};

export const formatDateTime = (date: Date | string): string => {
  return format(
    typeof date === "string" ? new Date(date) : date,
    "MMM d, yyyy 'at' h:mm a",
  );
};

export const formatRelative = (date: Date | string): string => {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // Same calendar day → intraday precision ("3 hours ago", "in 20 minutes").
  if (differenceInCalendarDays(parsed, now) === 0) {
    return formatDistanceToNowStrict(parsed, { addSuffix: true });
  }

  // Different calendar day → measure midnight-to-midnight so the displayed
  // day count tracks the date label rather than the wall-clock hour.
  return formatDistanceStrict(startOfDay(parsed), startOfDay(now), {
    addSuffix: true,
  });
};

export const formatOverdueDays = (dueAt: Date | string): string => {
  const date = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  const days = differenceInCalendarDays(new Date(), date);
  if (days <= 0) return "Reconnect today";
  return days === 1 ? "1 day past due" : `${days} days past due`;
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
