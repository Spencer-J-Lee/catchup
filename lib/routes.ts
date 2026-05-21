// TODO: Review
import type { Href } from "expo-router";

type FriendNewParams = {
  contact_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  contact_snapshot: string;
};

type EventNewParams = {
  friend_id: string;
  mode: "schedule" | "logCatchUp";
};

const AUTH = "/(auth)";
const FRIEND = "/friend";
const EVENT = "/event";

export const ROUTES = {
  home: "/",
  auth: {
    login: `${AUTH}/login`,
    signup: `${AUTH}/signup`,
  },
  friend: {
    pickContact: `${FRIEND}/pick-contact`,
    new: (params: FriendNewParams) => ({
      pathname: `${FRIEND}/new`,
      params,
    }),
    detail: (id: string) => ({
      pathname: `${FRIEND}/[id]`,
      params: { id },
    }),
    edit: (id: string) => ({
      pathname: `${FRIEND}/[id]/edit`,
      params: { id },
    }),
  },
  event: {
    new: (params?: EventNewParams) => ({
      pathname: `${EVENT}/new`,
      params,
    }),
    detail: (id: string) => ({
      pathname: `${EVENT}/[id]`,
      params: { id },
    }),
    edit: (id: string) => ({
      pathname: `${EVENT}/[id]/edit`,
      params: { id },
    }),
    followUp: (id: string) => ({
      pathname: `${EVENT}/[id]/follow-up`,
      params: { id },
    }),
  },
} satisfies {
  home: Href;
  auth: { login: Href; signup: Href };
  friend: {
    pickContact: Href;
    new: (params: FriendNewParams) => Href;
    detail: (id: string) => Href;
    edit: (id: string) => Href;
  };
  event: {
    new: (params?: EventNewParams) => Href;
    detail: (id: string) => Href;
    edit: (id: string) => Href;
    followUp: (id: string) => Href;
  };
};
