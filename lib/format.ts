import { format, formatDistanceToNowStrict } from "date-fns";

import type { Medium } from "@/types/database";

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
