// TODO: BEEG REVIEW 1

import type { FriendItemAction } from "@/components/friend/FriendListItem";
import type { FriendWithStatus } from "@/hooks/use-friends";

import type { FriendLifecycleState } from "../lifecycle";

export interface FriendRow {
  friend: FriendWithStatus;
  action: FriendItemAction | null;
  whenAt: string | null;
  scheduledEventId: string | null;
  isDue: boolean;
}

export interface FriendSection {
  title: string;
  count: number;
  state: FriendLifecycleState;
  data: FriendRow[];
}

export interface EventRef {
  id: string;
  event_at: string;
}

export interface EventIndexes {
  pastByFriend: Map<string, EventRef>;
  upcomingByFriend: Map<string, EventRef>;
}
