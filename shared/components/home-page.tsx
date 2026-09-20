import { AppPage } from "@/components/app/app-page";
import { LanguageSwitcher } from "@/components/i18n";
import { ModeToggle } from "@/components/ui/modeToggle";
import { T } from "@/components/i18n";
import { getT, type Locale } from "@/shared/i18n/server";

/**
 * Demo home content for app/[locale]/page.tsx. Shows both translation
 * patterns (server-side t() plus the client-side <T/> component) composed
 * from the App layer, no raw layout markup.
 */
export async function HomePage({ locale }: { locale: Locale }) {
  const { t } = await getT(locale);

  return (
    <AppPage
      titleKey="welcome"
      actions={
        <>
          <ModeToggle />
          <LanguageSwitcher />
        </>
      }
    >
      <p className="text-center text-muted-foreground">
        <T k="home.hint" />
      </p>
      <p className="mt-1 text-center text-muted-foreground">
        {t("hello.user", { name: "Leon" })}
      </p>
    </AppPage>
  );
}
