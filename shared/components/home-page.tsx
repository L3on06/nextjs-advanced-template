import { LanguageSwitcher, T } from "@/components/i18n";
import { ModeToggle } from "@/components/ui/modeToggle";
import { getT, type Locale } from "@/shared/i18n/server";

/**
 * Demo home content shared by app/page.tsx (cookie locale) and
 * app/[locale]/page.tsx (URL locale). Shows both translation patterns:
 * server-side t() and the client-side <T/> component.
 */
export async function HomePage({ locale }: { locale: Locale }) {
  const { t } = await getT(locale);

  return (
    <main>
      <div className="flex items-center justify-center gap-4">
        <ModeToggle />
        <LanguageSwitcher />
        <h1>{t("welcome")}</h1>
      </div>
      <p className="mt-4 text-center text-muted-foreground">
        <T k="home_hint" />
      </p>
      <p className="mt-1 text-center text-muted-foreground">
        {t("hello_user", { name: "Leon" })}
      </p>
    </main>
  );
}
