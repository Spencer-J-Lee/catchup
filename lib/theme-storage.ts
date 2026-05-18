import "expo-sqlite/localStorage/install";

export type ThemePref = "light" | "dark" | "system";

const KEY = "catchup.theme.v1";

export const readThemePref = (): ThemePref => {
  const raw = localStorage.getItem(KEY);
  return raw === "light" || raw === "dark" ? raw : "system";
};

export const writeThemePref = (pref: ThemePref) => {
  localStorage.setItem(KEY, pref);
};
