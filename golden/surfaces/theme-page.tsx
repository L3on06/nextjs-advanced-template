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
    <AppPage titleKey="theme.title">
      <AppCard titleKey="theme.mode">
        <AppSelect
          value={settings.mode}
          onChange={(mode) => update({ mode: mode as typeof settings.mode })}
          options={[
            { value: "light", labelKey: "theme.mode" },
            { value: "dark", labelKey: "theme.mode" },
            { value: "system", labelKey: "theme.mode" },
          ]}
        />
      </AppCard>
      <AppCard titleKey="theme.density">
        <AppButton onClick={() => update({ density: settings.density === "compact" ? "comfortable" : "compact" })}>
          <T k="theme.density" />
        </AppButton>
      </AppCard>
      <AppCard titleKey="theme.primary">
        <AppSelect
          value={settings.primary}
          onChange={(primary) => update({ primary: primary as typeof settings.primary })}
          options={[
            { value: "blue", labelKey: "theme.primary" },
            { value: "green", labelKey: "theme.primary" },
            { value: "violet", labelKey: "theme.primary" },
            { value: "amber", labelKey: "theme.primary" },
            { value: "rose", labelKey: "theme.primary" },
          ]}
        />
      </AppCard>
    </AppPage>
  );
}
