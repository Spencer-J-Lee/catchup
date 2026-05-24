import { colorScheme } from "nativewind";
import { create } from "zustand";

import { readThemePref, writeThemePref, type ThemePref } from "./theme-storage";

interface ThemeState {
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  pref: readThemePref(),
  setPref: (pref) => {
    colorScheme.set(pref);
    set({ pref });
    writeThemePref(pref);
  },
}));

// Apply persisted preference before first paint to avoid flash-of-wrong-theme.
colorScheme.set(useThemeStore.getState().pref);
