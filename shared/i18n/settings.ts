// Single source of truth for locale configuration.
//
// This module is intentionally dependency free (no JSON imports, no node
// APIs) so it can be imported from client components, server components,
// and proxy.ts (edge runtime). Keep it that way.
//
// To add a locale: extend LOCALES, add its meta below, create
// shared/translations/<locale>.json with the same flat keys, and wire the
// resources in shared/i18n/client.ts + shared/i18n/server.ts.

import type { TranslationKey } from "@/shared/translations";

export const LOCALES = ["en", "al"] as const;
export type Locale = (typeof LOCALES)[number];

export const COOKIE_NAME = "NEXT_LOCALE";
export const STORAGE_KEY = "NEXT_LOCALE";

const envDefault = process.env.NEXT_PUBLIC_I18N_DEFAULT_LOCALE;

export const DEFAULT_LOCALE: Locale = isLocale(envDefault)
  ? envDefault
  : "en";

// "true" -> locale lives in the URL (/en, /al) via proxy.ts.
// Anything else -> cookie based, URLs stay clean.
export const PREFIX_ENABLED =
  process.env.NEXT_PUBLIC_I18N_PREFIX_LOCALE === "true";

export const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  // flag uses flag-icons country codes (en -> gb, al -> al).
  en: { label: "English", flag: "gb" },
  al: { label: "Shqip", flag: "al" },
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/** Split a pathname into its locale prefix (if any) and the rest of the path. */
export function stripLocalePrefix(pathname: string): {
  locale: Locale | null;
  pathnameWithoutLocale: string;
} {
  const segment = pathname.split("/")[1];
  if (isLocale(segment)) {
    const rest = pathname.slice(segment.length + 1) || "/";
    return { locale: segment, pathnameWithoutLocale: rest };
  }
  return { locale: null, pathnameWithoutLocale: pathname || "/" };
}

export type { TranslationKey };
