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

const STATUS_META: Record<EventStatus, { label: string; stripClass: string }> =
  {
    scheduled: {
      label: "Scheduled",
      stripClass: "bg-brand dark:bg-brand-dk",
    },
    completed: {
      label: "Completed",
      stripClass: "bg-success dark:bg-success-dk",
    },
    missed: {
      label: "Missed",
      stripClass: "bg-danger dark:bg-danger-dk",
    },
    cancelled: {
      label: "Cancelled",
      stripClass: "bg-muted dark:bg-muted-dk",
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
  const when = new Date(event.event_at);
  const timeDigits = format(when, "h:mm");
  const timeMeridiem = format(when, "a");
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
        className="flex-row items-center gap-3 overflow-hidden"
        accessibilityLabel={`${meta.label} · ${friendLabel} at ${timeDigits} ${timeMeridiem}${subline ? ` · ${subline}` : ""}`}
      >
        <View
          className={classNames(
            "absolute left-0 top-0 bottom-0 w-2",
            meta.stripClass,
          )}
          accessibilityLabel={meta.label}
        />
        <View className="w-14 items-end">
          <Text className="text-lg font-semibold text-default dark:text-default-dk">
            {timeDigits}
          </Text>
          <Text className="text-xs font-semibold uppercase tracking-wide -mt-1 text-muted dark:text-muted-dk">
            {timeMeridiem}
          </Text>
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
