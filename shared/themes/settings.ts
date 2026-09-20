import {
  DENSITIES,
  MODES,
  PRIMARY_SWATCHES,
  type Density,
  type PrimarySwatch,
  type ThemeMode,
} from "@/shared/themes/theme-config";

/**
 * Settings API: read plus write theme choices with no source mutation.
 * Persisted in local storage under fixed keys. Server safe: reads return
 * defaults outside the browser. A later settings screen talks only to these
 * functions; the provider below applies them to the document.
 */

export const THEME_KEYS = {
  mode: "theme",
  density: "density",
  primary: "primary-swatch",
} as const;

export interface ThemeSettings {
  mode: ThemeMode;
  density: Density;
  primary: PrimarySwatch;
}

export const DEFAULT_SETTINGS: ThemeSettings = {
  mode: "system",
  density: "comfortable",
  primary: "blue",
};

function readKey(key: string): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getThemeSettings(): ThemeSettings {
  const mode = readKey(THEME_KEYS.mode);
  const density = readKey(THEME_KEYS.density);
  const primary = readKey(THEME_KEYS.primary);
  return {
    mode: (MODES as readonly string[]).includes(mode ?? "") ? (mode as ThemeMode) : DEFAULT_SETTINGS.mode,
    density: (DENSITIES as readonly string[]).includes(density ?? "")
      ? (density as Density)
      : DEFAULT_SETTINGS.density,
    primary: (PRIMARY_SWATCHES as readonly string[]).includes(primary ?? "")
      ? (primary as PrimarySwatch)
      : DEFAULT_SETTINGS.primary,
  };
}

export function setThemeSettings(partial: Partial<ThemeSettings>): ThemeSettings {
  const current = getThemeSettings();
  const next: ThemeSettings = {
    mode: partial.mode ?? current.mode,
    density: partial.density ?? current.density,
    primary: partial.primary ?? current.primary,
  };
  if (!(MODES as readonly string[]).includes(next.mode)) throw new Error(`Unknown theme mode: ${next.mode}`);
  if (!(DENSITIES as readonly string[]).includes(next.density)) throw new Error(`Unknown density: ${next.density}`);
  if (!(PRIMARY_SWATCHES as readonly string[]).includes(next.primary)) {
    throw new Error(`Unknown primary swatch: ${next.primary}`);
  }
  try {
    localStorage.setItem(THEME_KEYS.mode, next.mode);
    localStorage.setItem(THEME_KEYS.density, next.density);
    localStorage.setItem(THEME_KEYS.primary, next.primary);
  } catch {
    // Storage may refuse (private mode); the live document still updates.
  }
  window.dispatchEvent(new CustomEvent("theme-settings", { detail: next }));
  return next;
}

export function subscribeTheme(listener: (settings: ThemeSettings) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<ThemeSettings>).detail);
  window.addEventListener("theme-settings", handler);
  return () => window.removeEventListener("theme-settings", handler);
}
