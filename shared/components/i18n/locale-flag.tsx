import { cn } from "cn";
import { LOCALE_META, type Locale } from "@/shared/i18n/settings";

/** Dynamic flag from flag-icons. Add a locale by extending LOCALE_META only. */
export function LocaleFlag({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "fi inline-block overflow-hidden rounded-[3px]",
        `fi-${LOCALE_META[locale].flag}`,
        className,
      )}
    />
  );
}
