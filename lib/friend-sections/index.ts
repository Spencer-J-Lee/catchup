// TODO: BEEG REVIEW 1

import type { FriendWithStatus } from "@/hooks/use-friends";
import type { CatchUpEvent } from "@/types/database";

import { formatLifecycleState, type FriendLifecycleState } from "../lifecycle";
import { classifyFriend } from "./classifyFriend";
import {
  compareByWhenAt,
  compareCaughtUp,
  compareDueRows,
} from "./comparators";
import { buildEventIndexes } from "./eventIndexes";
import type { FriendRow, FriendSection } from "./types";

export type { FriendRow, FriendSection } from "./types";

export interface BuildFriendSectionsArgs {
  friends: FriendWithStatus[] | undefined;
  scheduledEvents: CatchUpEvent[] | undefined;
  missedEvents: CatchUpEvent[] | undefined;
  search: string;
}

const matchesQuery = (friend: FriendWithStatus, query: string): boolean =>
  `${friend.first_name} ${friend.last_name ?? ""}`
    .toLowerCase()
    .includes(query);

export const buildFriendSections = ({
  friends,
  scheduledEvents,
  missedEvents,
  search,
}: BuildFriendSectionsArgs): FriendSection[] => {
  if (!friends) return [];

  const now = new Date();
  const indexes = buildEventIndexes(
    scheduledEvents,
    missedEvents,
    now.getTime(),
  );

  const query = search.trim().toLowerCase();
  const filtered = query
    ? friends.filter((friend) => matchesQuery(friend, query))
    : friends;

  const groups: Record<FriendLifecycleState, FriendRow[]> = {
    awaiting_followup: [],
    scheduled: [],
    due: [],
    caught_up: [],
  };

  for (const friend of filtered) {
    const { state, row } = classifyFriend(friend, indexes, now);
    groups[state].push(row);
  }

  groups.awaiting_followup.sort(compareByWhenAt);
  groups.scheduled.sort(compareByWhenAt);
  groups.due.sort(compareDueRows);
  groups.caught_up.sort(compareCaughtUp);

  const sections: FriendSection[] = [];
  const pushGroup = (state: FriendLifecycleState) => {
    const rows = groups[state];
    if (rows.length === 0) return;

    sections.push({
      title: formatLifecycleState(state),
      count: rows.length,
      state,
      data: rows,
    });
  };

  pushGroup("awaiting_followup");
  pushGroup("scheduled");
  pushGroup("due");
  pushGroup("caught_up");

  return sections;
};
