import type { ContactSnapshot } from "@/lib/contacts";

import type { SeedContact } from "./types";

// Trailing middle dot on last_name marks a row as seed data. Chosen to look
// like an unobtrusive character rather than an obvious tag, so the data
// resembles real entries while staying easy to identify for cleanup.
export const SEED_MARKER = "·";

export const mark = (lastName: string): string => {
  return `${lastName}${SEED_MARKER}`;
};

const PORTRAITS = {
  "alex-chen": "https://randomuser.me/api/portraits/men/32.jpg",
  "dana-wu": "https://randomuser.me/api/portraits/women/68.jpg",
  "faye-holloway": "https://randomuser.me/api/portraits/women/22.jpg",
  "harper-singh": "https://randomuser.me/api/portraits/women/12.jpg",
  "kai-nakamura": "https://randomuser.me/api/portraits/men/77.jpg",
  "marlowe-quinn": "https://randomuser.me/api/portraits/women/45.jpg",
  "jules-marchetti": "https://randomuser.me/api/portraits/men/18.jpg",
} as const;

// Constrained to known keys so a typo is a compile error rather than an
// undefined avatar_url that slips through at runtime.
export const avatarFor = (seed: keyof typeof PORTRAITS): string => {
  return PORTRAITS[seed];
};

export const contactFor = (args: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  imageUri?: string | null;
  syncedDaysAgo: number;
}): SeedContact => {
  return {
    id: args.id,
    syncedDaysAgo: args.syncedDaysAgo,
    snapshot: {
      name: args.name,
      phone: args.phone,
      email: args.email,
      phones: [{ label: "mobile", number: args.phone }],
      emails: args.email ? [{ label: "personal", email: args.email }] : [],
      image_uri: args.imageUri ?? null,
    },
  };
};

export const isoOffsetDays = (
  days: number,
  atHour?: number,
  atMinute?: number,
): string => {
  const date = new Date(Date.now() + days * 86_400_000);
  if (atHour !== undefined) {
    date.setHours(atHour, atMinute ?? 0, 0, 0);
  }
  return date.toISOString();
};
