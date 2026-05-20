import { SettingsSection } from "@/components/settings/SettingsSection";
import { ChipRow } from "@/components/ui/ChipRow";
import { Pill } from "@/components/ui/Pill";
import { useThemeStore } from "@/lib/theme-store";
import type { ThemePref } from "@/lib/theme-storage";

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const ThemeSection = () => {
  const pref = useThemeStore((s) => s.pref);
  const setPref = useThemeStore((s) => s.setPref);

  return (
    <SettingsSection label="Appearance">
      <ChipRow>
        {OPTIONS.map((opt) => (
          <Pill
            key={opt.value}
            variant={pref === opt.value ? "primary" : "secondary"}
            label={opt.label}
            onPress={() => setPref(opt.value)}
          />
        ))}
      </ChipRow>
    </SettingsSection>
  );
};
