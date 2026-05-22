import { Linking, Platform } from "react-native";

import { DividedList } from "@/components/ui/DividedList";
import { PressableRow } from "@/components/ui/PressableRow";
import { Row } from "@/components/ui/Row";
import { Surface } from "@/components/ui/Surface";
import { useFormatters } from "@/hooks/use-formatters";
import { formatMedium, formatStatus } from "@/lib/format";
import type { CatchUpEvent } from "@/types/database";

interface EventDetailsCardProps {
  event: CatchUpEvent;
}

export const EventDetailsCard = ({ event }: EventDetailsCardProps) => {
  const { formatDateTime } = useFormatters();

  const openMaps = () => {
    if (!event.location_address) return;

    const query = encodeURIComponent(event.location_address);
    const url =
      Platform.OS === "ios" ? `maps://?q=${query}` : `geo:0,0?q=${query}`;

    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${query}`),
    );
  };

  return (
    <Surface>
      <DividedList>
        <Row label="Status" value={formatStatus(event.status)} />

        <Row
          label={event.status === "scheduled" ? "Scheduled" : "When"}
          value={formatDateTime(event.event_at)}
        />

        {event.medium ? (
          <Row
            label="Medium"
            value={`${formatMedium(event.medium)}${event.medium_detail ? ` · ${event.medium_detail}` : ""}`}
          />
        ) : null}

        {event.location_address ? (
          <PressableRow
            label="Location"
            value={event.location_text || event.location_address}
            onPress={openMaps}
            textStyle="link"
          />
        ) : event.location_text ? (
          <Row label="Location" value={event.location_text} />
        ) : null}
      </DividedList>
    </Surface>
  );
};
