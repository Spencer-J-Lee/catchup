import classNames from "classnames";
import { isThisYear } from "date-fns";
import { Link } from "expo-router";
import { Text, View } from "react-native";

import { PressableSurface } from "@/components/ui/Surface";
import { useFormatters } from "@/hooks/use-formatters";
import { formatMedium } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import type { CatchUpEvent, EventStatus } from "@/types/database";

const STATUS_META: Record<
  EventStatus,
  { label: string; pill: string; text: string }
> = {
  scheduled: {
    label: "Scheduled",
    pill: "bg-brand/15 dark:bg-brand-dk/25 border-brand dark:border-brand-dk",
    text: "text-brand dark:text-brand-dk",
  },
  completed: {
    label: "Completed",
    pill: "bg-success/15 dark:bg-success-dk/25 border-success dark:border-success-dk",
    text: "text-success dark:text-success-dk",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-high dark:bg-high-dk border-border dark:border-border-dk",
    text: "text-muted dark:text-muted-dk",
  },
};

interface HistoryItemProps {
  event: CatchUpEvent;
}

export const HistoryItem = ({ event }: HistoryItemProps) => {
  const meta = STATUS_META[event.status];
  const when = new Date(event.event_at);
  const { formatPattern } = useFormatters();
  const mediumDisplay = event.medium
    ? `${formatMedium(event.medium)}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`
    : "";

  return (
    <Link href={ROUTES.event.detail(event.id)} asChild>
      <PressableSurface size="sm" className="gap-2">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-lg bg-high dark:bg-high-dk">
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-subtle dark:text-subtle-dk">
              {formatPattern(when, "MMM")}
            </Text>

            <Text
              className={classNames(
                "font-bold leading-tight text-default dark:text-default-dk",
                isThisYear(when) ? "text-xl" : "text-base",
              )}
            >
              {formatPattern(when, "d")}
            </Text>

            {!isThisYear(when) ? (
              <Text className="text-[9px] leading-tight text-subtle dark:text-subtle-dk">
                {formatPattern(when, "yyyy")}
              </Text>
            ) : null}
          </View>

          <Text
            className="flex-1 text-base font-medium text-default dark:text-default-dk"
            numberOfLines={1}
          >
            {mediumDisplay}
          </Text>

          <View
            className={classNames("rounded-full border px-2 py-0.5", meta.pill)}
          >
            <Text className={classNames("text-xs font-semibold", meta.text)}>
              {meta.label}
            </Text>
          </View>
        </View>

        {event.event_notes ? (
          <Text
            className="text-sm text-muted dark:text-muted-dk"
            numberOfLines={3}
          >
            {event.event_notes}
          </Text>
        ) : null}
      </PressableSurface>
    </Link>
  );
};
