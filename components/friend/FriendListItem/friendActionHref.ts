import type { Href } from "expo-router";

import { ROUTES } from "@/lib/routes";

import type { FriendItemAction } from "./types";

export const resolveFriendActionHref = (
  friendId: string,
  action: FriendItemAction,
  scheduledEventId: string | null | undefined,
): Href => {
  if (action === "followUp" && scheduledEventId) {
    return ROUTES.event.followUp(scheduledEventId);
  }

  if (action === "reschedule" && scheduledEventId) {
    return ROUTES.event.edit(scheduledEventId);
  }

  if (action === "schedule") {
    return ROUTES.event.new({ friend_id: friendId, mode: "schedule" });
  }

  return ROUTES.event.new({ friend_id: friendId, mode: "logCatchUp" });
};
