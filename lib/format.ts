import { format, formatDistanceToNowStrict } from "date-fns";

import type { EventStatus, Medium } from "@/types/database";

export function formatDate(d: Date | string): string {
  return format(typeof d === "string" ? new Date(d) : d, "MMM d, yyyy");
}

export function formatDateTime(d: Date | string): string {
  return format(
    typeof d === "string" ? new Date(d) : d,
    "MMM d, yyyy 'at' h:mm a",
  );
}

export function formatRelative(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function fullName(parts: {
  first_name: string;
  last_name?: string | null;
}): string {
  const last = parts.last_name?.trim();
  return last ? `${parts.first_name} ${last}` : parts.first_name;
}

export function initialsOf(
  firstName: string,
  lastName?: string | null,
): string {
  const first = firstName.trim();
  const last = lastName?.trim() ?? "";
  if (first && last) {
    return (first[0]! + last[0]!).toUpperCase();
  }
  if (first) {
    return first.slice(0, 2).toUpperCase();
  }
  return "?";
}

export function formatStatus(s: EventStatus): string {
  switch (s) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "missed":
      return "Missed";
    case "cancelled":
      return "Cancelled";
  }
}

export function formatMedium(m: Medium | null | undefined): string {
  switch (m) {
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
}
