import type { Ionicons } from "@expo/vector-icons";

import type { EventStatus } from "@/types/database";

export type FollowUpStatus = Extract<EventStatus, "completed" | "cancelled">;
export type FollowUpOptionKey = FollowUpStatus | "rescheduled";

export interface StatusOption {
  key: FollowUpOptionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgClass: string;
  badgeClass: string;
  badgeTextClass: string;
}

export const STATUS_OPTIONS_BY_KEY = {
  completed: {
    key: "completed",
    label: "Completed",
    icon: "checkmark",
    iconBgClass: "bg-success dark:bg-success-dk",
    badgeClass: "bg-success/15 dark:bg-success-dk/20",
    badgeTextClass: "text-success dark:text-success-dk",
  },
  rescheduled: {
    key: "rescheduled",
    label: "Rescheduled",
    icon: "calendar",
    iconBgClass: "bg-accent dark:bg-accent-dk",
    badgeClass: "bg-accent/15 dark:bg-accent-dk/20",
    badgeTextClass: "text-accent dark:text-accent-dk",
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    icon: "remove",
    iconBgClass: "bg-[#8a8a93] dark:bg-[#5e5e66]",
    badgeClass: "bg-[#e4e4e7] dark:bg-high-dk",
    badgeTextClass: "text-muted dark:text-muted-dk",
  },
} satisfies Record<FollowUpOptionKey, StatusOption>;

export const STATUS_OPTIONS: StatusOption[] = [
  STATUS_OPTIONS_BY_KEY.completed,
  STATUS_OPTIONS_BY_KEY.rescheduled,
  STATUS_OPTIONS_BY_KEY.cancelled,
];

export const FADE_MS = 300;
