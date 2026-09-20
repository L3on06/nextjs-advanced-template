/**
 * Typed design configuration: the single source for look plus language.
 * Setup stamps the chosen values into this shape; the build rejects anything
 * outside the closed sets below. Mirrors the setup wizard questions so every
 * answer lands in exactly one field.
 */

export const THEME_STYLES = ["minimal", "bold", "playful"] as const;
export type ThemeStyle = (typeof THEME_STYLES)[number];

export const BASE_COLORS = ["neutral", "slate", "stone"] as const;
export type BaseColor = (typeof BASE_COLORS)[number];

export const PRIMARY_SWATCHES = ["blue", "green", "violet", "amber", "rose"] as const;
export type PrimarySwatch = (typeof PRIMARY_SWATCHES)[number];

export const RADII = ["0.5", "0.625", "0.75", "1.0"] as const;
export type RadiusStep = (typeof RADII)[number];

export const SANS_FONTS = ["Geist", "system"] as const;
export const MONO_FONTS = ["Geist Mono", "system"] as const;

export const BASE_SIZES = [14, 16, 18] as const;
export type BaseSize = (typeof BASE_SIZES)[number];

export const ICON_SETS = ["lucide"] as const;
export type IconSet = (typeof ICON_SETS)[number];

export const ICON_SIZES = ["sm", "md", "lg"] as const;

export const MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof MODES)[number];

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export const LOCALES = ["en", "al"] as const;
export type Locale = (typeof LOCALES)[number];

export interface ThemeConfig {
  style: ThemeStyle;
  baseColor: BaseColor;
  primary: PrimarySwatch;
  radius: RadiusStep;
  typography: { sans: (typeof SANS_FONTS)[number]; mono: (typeof MONO_FONTS)[number]; baseSize: BaseSize };
  icons: { set: IconSet; size: (typeof ICON_SIZES)[number] };
  animation: { fastMs: 120; normalMs: 200; slowMs: 320; easing: "ease-out" };
  mode: ThemeMode;
  density: Density;
}

export interface LocaleConfig {
  defaultLocale: Locale;
  additionalLocales: Locale[];
  routing: "prefixed";
  messagePaths: Record<Locale, string>;
}

/** Primary swatch values in OKLCH, light plus dark. Applied at runtime. */
export const PRIMARY_VALUES: Record<PrimarySwatch, { light: string; dark: string }> = {
  blue: { light: "oklch(0.488 0.243 264.376)", dark: "oklch(0.623 0.214 259.815)" },
  green: { light: "oklch(0.527 0.154 150.069)", dark: "oklch(0.673 0.15 150.069)" },
  violet: { light: "oklch(0.541 0.281 293.009)", dark: "oklch(0.654 0.211 293.009)" },
  amber: { light: "oklch(0.666 0.179 58.318)", dark: "oklch(0.769 0.164 58.318)" },
  rose: { light: "oklch(0.586 0.253 17.585)", dark: "oklch(0.712 0.194 17.585)" },
};

export const DEFAULT_THEME: ThemeConfig = {
  style: "minimal",
  baseColor: "neutral",
  primary: "blue",
  radius: "0.75",
  typography: { sans: "Geist", mono: "Geist Mono", baseSize: 16 },
  icons: { set: "lucide", size: "md" },
  animation: { fastMs: 120, normalMs: 200, slowMs: 320, easing: "ease-out" },
  mode: "system",
  density: "comfortable",
};

export const DEFAULT_LOCALES: LocaleConfig = {
  defaultLocale: "en",
  additionalLocales: ["al"],
  routing: "prefixed",
  messagePaths: { en: "messages/en.json", al: "messages/al.json" },
};
