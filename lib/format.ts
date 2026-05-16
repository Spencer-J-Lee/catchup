import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
} from "date-fns";

import type { EventStatus, Medium } from "@/types/database";

export const formatDate = (date: Date | string): string => {
  return format(typeof date === "string" ? new Date(date) : date, "MMM d, yyyy");
};

export const formatDateTime = (date: Date | string): string => {
  return format(
    typeof date === "string" ? new Date(date) : date,
    "MMM d, yyyy 'at' h:mm a",
  );
};

export const formatRelative = (date: Date | string): string => {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

export const formatOverdueDays = (dueAt: Date | string): string => {
  const date = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  const days = differenceInCalendarDays(new Date(), date);
  if (days <= 0) return "Due today";
  return days === 1 ? "1 day overdue" : `${days} days overdue`;
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
    default:
      return "";
  }
};
