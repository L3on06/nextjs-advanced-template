"use client";

import { AppButton } from "@/components/app/app-button";
import { AppCard } from "@/components/app/app-card";
import { AppPage } from "@/components/app/app-page";
import { AppSelect } from "@/components/app/app-select";
import { T } from "@/components/i18n";
import { useThemeSettings } from "@/shared/themes/use-theme-settings";

/** Golden demo surface: live mode plus density plus primary switching. */
export default function GoldenThemePage() {
  const { settings, update } = useThemeSettings();
  return (
    <AppPage titleKey="theme_title">
      <AppCard titleKey="theme_mode">
        <AppSelect
          value={settings.mode}
          onChange={(mode) => update({ mode: mode as typeof settings.mode })}
          options={[
            { value: "light", labelKey: "theme_mode" },
            { value: "dark", labelKey: "theme_mode" },
            { value: "system", labelKey: "theme_mode" },
          ]}
        />
      </AppCard>
      <AppCard titleKey="theme_density">
        <AppButton onClick={() => update({ density: settings.density === "compact" ? "comfortable" : "compact" })}>
          <T k="theme_density" />
        </AppButton>
      </AppCard>
      <AppCard titleKey="theme_primary">
        <AppSelect
          value={settings.primary}
          onChange={(primary) => update({ primary: primary as typeof settings.primary })}
          options={[
            { value: "blue", labelKey: "theme_primary" },
            { value: "green", labelKey: "theme_primary" },
            { value: "violet", labelKey: "theme_primary" },
            { value: "amber", labelKey: "theme_primary" },
            { value: "rose", labelKey: "theme_primary" },
          ]}
        />
      </AppCard>
    </AppPage>
  );
}
