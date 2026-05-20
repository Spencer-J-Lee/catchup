import type { Ionicons } from "@expo/vector-icons";

import type { EventStatus } from "@/types/database";

export type FollowUpStatus = Extract<
  EventStatus,
  "completed" | "missed" | "cancelled"
>;

export interface StatusOption {
  status: FollowUpStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgClass: string;
  badgeClass: string;
  badgeTextClass: string;
}

export const STATUS_OPTIONS_BY_STATUS = {
  completed: {
    status: "completed",
    label: "Completed",
    icon: "checkmark",
    iconBgClass: "bg-success dark:bg-success-dk",
    badgeClass: "bg-success/15 dark:bg-success-dk/20",
    badgeTextClass: "text-success dark:text-success-dk",
  },
  missed: {
    status: "missed",
    label: "Missed",
    icon: "close",
    iconBgClass: "bg-danger dark:bg-danger-dk",
    badgeClass: "bg-danger/15 dark:bg-danger-dk/20",
    badgeTextClass: "text-danger dark:text-danger-dk",
  },
  cancelled: {
    status: "cancelled",
    label: "Cancelled",
    icon: "remove",
    iconBgClass: "bg-[#8a8a93] dark:bg-[#5e5e66]",
    badgeClass: "bg-[#e4e4e7] dark:bg-high-dk",
    badgeTextClass: "text-muted dark:text-muted-dk",
  },
} satisfies Record<FollowUpStatus, StatusOption>;

export const STATUS_OPTIONS: StatusOption[] = [
  STATUS_OPTIONS_BY_STATUS.completed,
  STATUS_OPTIONS_BY_STATUS.missed,
  STATUS_OPTIONS_BY_STATUS.cancelled,
];

export const FADE_MS = 300;
