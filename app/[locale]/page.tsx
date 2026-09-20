import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";
import { isLocale } from "@/shared/i18n/settings";

/** Prefix-mode home (/en, /al). Same content as /, resolved from the URL. */
export default async function LocaleHome({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <HomePage locale={locale} />;
}
