"use client";

import { useEffect, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { createClientI18n } from "@/shared/i18n/client";
import {
  COOKIE_NAME,
  DEFAULT_LOCALE,
  isLocale,
  PREFIX_ENABLED,
  STORAGE_KEY,
  stripLocalePrefix,
  type Locale,
} from "@/shared/i18n/settings";

/**
 * THE single integration point for locale logic.
 * Every page renders inside this provider (see app/layout.tsx and
 * app/[locale]/layout.tsx), so changing how the locale is stored,
 * detected, or routed means editing this file only.
 */

// Only the innermost mounted provider owns document.lang. Child effects run
// before parent effects, so a nested provider claims ownership first and an
// outer one stands down instead of overwriting it. Effects never run during
// server prerendering, so this client only ownership is safe.
let documentLangOwner: object | null = null;

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [instance] = useState(() => createClientI18n(locale));
  const [token] = useState<object>(() => ({}));

  useEffect(() => {
    if (instance.language !== locale) {
      void instance.changeLanguage(locale);
    }
  }, [instance, locale]);

  useEffect(() => {
    if (documentLangOwner !== null && documentLangOwner !== token) return;
    documentLangOwner = token;
    document.documentElement.lang = locale;
    return () => {
      if (documentLangOwner === token) documentLangOwner = null;
    };
  }, [locale, token]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

/** Current locale on the client. */
export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
}

/** Typed client translator. Re-export of react-i18next, kept here on purpose. */
export { useTranslation as useT } from "react-i18next";

/**
 * Switch locale everywhere at once: cookie + localStorage for persistence,
 * then either navigate to the /<locale> prefixed URL (prefix mode) or swap
 * the language in place and refresh server components (cookie mode).
 */
export function useChangeLocale(): (next: Locale) => void {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  return (next: Locale) => {
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode etc. Cookie already persisted the choice.
    }

    if (PREFIX_ENABLED) {
      const { pathnameWithoutLocale } = stripLocalePrefix(pathname ?? "/");
      const suffix = pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale;
      router.push(`/${next}${suffix}`);
    } else {
      void i18n.changeLanguage(next);
      router.refresh();
    }
  };
}
