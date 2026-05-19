// TODO: REVIEW

import classNames from "classnames";
import { format } from "date-fns";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { FriendAvatar } from "@/components/friend/FriendListItem/FriendAvatar";
import { PressableSurface } from "@/components/ui/Surface";
import { formatMedium, fullName } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { CatchUpEvent, EventStatus } from "@/types/database";

const STATUS_META: Record<EventStatus, { label: string; dotClass: string }> = {
  scheduled: {
    label: "Scheduled",
    dotClass: "bg-brand dark:bg-brand-dk",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-success dark:bg-success-dk",
  },
  missed: {
    label: "Missed",
    dotClass: "bg-danger dark:bg-danger-dk",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-muted dark:bg-muted-dk",
  },
};

export type CalendarAgendaFriend = {
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
};

interface CalendarAgendaItemProps {
  event: CatchUpEvent;
  friend: CalendarAgendaFriend | undefined;
}

export const CalendarAgendaItem = ({
  event,
  friend,
}: CalendarAgendaItemProps) => {
  const whenISO = event.occurred_at ?? event.scheduled_at;
  const when = whenISO ? new Date(whenISO) : null;
  const timeDigits = when ? format(when, "h:mm") : "";
  const timeMeridiem = when ? format(when, "a") : "";
  const meta = STATUS_META[event.status];
  const friendLabel = friend ? fullName(friend) : "Unknown friend";

  const subline = [
    event.medium ? formatMedium(event.medium) : null,
    event.location_text || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={ROUTES.event.detail(event.id)} asChild>
      <PressableSurface
        size="sm"
        className="flex-row items-center gap-3"
        accessibilityLabel={`${meta.label} · ${friendLabel}${timeDigits ? ` at ${timeDigits} ${timeMeridiem}` : ""}${subline ? ` · ${subline}` : ""}`}
      >
        <View className="w-14 items-end gap-1">
          <View
            className={classNames("w-2 h-2 rounded-full", meta.dotClass)}
            accessibilityLabel={meta.label}
          />
          <View className="items-end">
            <Text className="text-lg font-semibold text-default dark:text-default-dk">
              {timeDigits}
            </Text>
            <Text className="text-xs font-semibold uppercase tracking-wide -mt-1 text-muted dark:text-muted-dk">
              {timeMeridiem}
            </Text>
          </View>
        </View>

        {friend ? <FriendAvatar friend={friend} /> : null}

        <View className="flex-1 min-w-0 gap-0.5">
          <Text
            className="text-base font-semibold text-default dark:text-default-dk"
            numberOfLines={1}
          >
            {friendLabel}
          </Text>
          {subline ? (
            <Text
              className="text-sm text-muted dark:text-muted-dk"
              numberOfLines={1}
            >
              {subline}
            </Text>
          ) : null}
        </View>
      </PressableSurface>
    </Link>
  );
};
