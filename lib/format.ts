import { format, formatDistanceToNowStrict } from "date-fns";

export function formatDate(d: Date | string): string {
  return format(typeof d === "string" ? new Date(d) : d, "MMM d, yyyy");
}

export function formatDateTime(d: Date | string): string {
  return format(typeof d === "string" ? new Date(d) : d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}
