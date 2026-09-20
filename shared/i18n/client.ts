import { createInstance, type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { al, en } from "@/shared/translations";
import { DEFAULT_LOCALE, type Locale } from "./settings";

const resources = {
  en: { translation: en },
  al: { translation: al },
} as const;

/**
 * Create a fresh client-side i18next instance for the given locale.
 * A new instance per I18nProvider (instead of one global singleton) keeps
 * server prerendering safe when concurrent requests use different locales.
 */
export function createClientI18n(locale: Locale): I18nInstance {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    resources,
    defaultNS: "translation",
    // Keys are flat strings (see shared/translations). Never interpret dots.
    keySeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}
