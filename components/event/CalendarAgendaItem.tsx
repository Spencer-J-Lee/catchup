import classNames from "classnames";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { FriendAvatar } from "@/components/friend/FriendListItem/FriendAvatar";
import { PressableSurface } from "@/components/ui/Surface";
import { useFormatters } from "@/hooks/use-formatters";
import { formatMedium, fullName } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { CatchUpEvent, EventStatus, Friend } from "@/types/database";

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

type CalendarAgendaFriend = Pick<
  Friend,
  "first_name" | "last_name" | "avatar_url"
>;

const PLACEHOLDER_FRIEND: CalendarAgendaFriend = {
  first_name: "",
  last_name: null,
  avatar_url: null,
};

interface CalendarAgendaItemProps {
  event: CatchUpEvent;
  friend: CalendarAgendaFriend | undefined;
}

export const CalendarAgendaItem = ({
  event,
  friend,
}: CalendarAgendaItemProps) => {
  const { formatPattern } = useFormatters();
  const timeDigits = formatPattern(event.event_at, "h:mm");
  const timeMeridiem = formatPattern(event.event_at, "a");
  const meta = STATUS_META[event.status];
  const friendLabel = friend ? fullName(friend) : "Unknown friend";

  const subline = [
    event.medium ? formatMedium(event.medium) : null,
    event.location_text,
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
            "absolute bottom-0 left-0 top-0 w-2",
            meta.stripClass,
          )}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
        <View className="w-14 items-end">
          <Text className="text-lg font-semibold text-default dark:text-default-dk">
            {timeDigits}
          </Text>
          <Text className="-mt-1 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dk">
            {timeMeridiem}
          </Text>
        </View>

        <FriendAvatar friend={friend ?? PLACEHOLDER_FRIEND} />

        <View className="min-w-0 flex-1 gap-0.5">
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
