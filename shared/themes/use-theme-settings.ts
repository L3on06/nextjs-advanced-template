"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PRIMARY_VALUES } from "@/shared/themes/theme-config";
import {
  getThemeSettings,
  setThemeSettings,
  subscribeTheme,
  type ThemeSettings,
} from "@/shared/themes/settings";

/**
 * Live theme wiring. Mode rides next-themes (class strategy, persisted under
 * its own key). Density rides a data-density attribute. Primary rides an
 * inline --primary variable that wins in both modes. All three switch with
 * no rebuild and no source edits.
 */
export function useThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>(() => getThemeSettings());

  useEffect(() => {
    setSettings(getThemeSettings());
    return subscribeTheme(setSettings);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.density = settings.density;
    const dark = resolvedTheme === "dark";
    const swatch = PRIMARY_VALUES[settings.primary];
    document.documentElement.style.setProperty("--primary", dark ? swatch.dark : swatch.light);
  }, [settings, resolvedTheme]);

  const update = useCallback(
    (partial: Partial<ThemeSettings>) => {
      const next = setThemeSettings(partial);
      if (partial.mode) setTheme(partial.mode);
      setSettings(next);
    },
    [setTheme],
  );

  return { settings, theme, update };
}
