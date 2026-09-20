import "server-only";

import { createInstance, type TFunction } from "i18next";
import { cookies } from "next/headers";
import { al, en, type TranslationKey } from "@/shared/translations";
import {
  COOKIE_NAME,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "./settings";

const resources = {
  en: { translation: en },
  al: { translation: al },
} as const;

/** Locale for the current request when there is no URL prefix (cookie based). */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** Typed server-side translator. Use inside server components, layouts, pages. */
export async function getT(locale: Locale): Promise<{
  t: TFunction;
  locale: Locale;
}> {
  const instance = createInstance();
  await instance.init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    resources,
    defaultNS: "translation",
    keySeparator: false,
    interpolation: { escapeValue: false },
  });
  return { t: instance.t.bind(instance), locale };
}

export type { Locale, TranslationKey };
