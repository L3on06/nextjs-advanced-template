import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/i18n";
import { isLocale, LOCALES } from "@/shared/i18n/settings";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Prefix-mode layout (/en, /al). Validates the URL locale, then provides it. */
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
