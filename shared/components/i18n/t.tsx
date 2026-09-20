"use client";

import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@/shared/translations";

/** Render a translated string in client components: <T k="welcome" />. */
export function T({
  k,
  values,
}: {
  k: TranslationKey;
  values?: Record<string, string | number>;
}) {
  const { t } = useTranslation();
  return <>{t(k, values)}</>;
}
