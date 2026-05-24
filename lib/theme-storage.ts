import "expo-sqlite/localStorage/install";

import { themePrefSchema, type ThemePref } from "./schemas";

export type { ThemePref };

const THEME_PREF_KEY = "catchup.theme.v1";

export const readThemePref = (): ThemePref =>
  themePrefSchema.catch("system").parse(localStorage.getItem(THEME_PREF_KEY));

export const writeThemePref = (pref: ThemePref) => {
  localStorage.setItem(THEME_PREF_KEY, pref);
};
