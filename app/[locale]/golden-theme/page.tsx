import { notFound } from "next/navigation";
import GoldenThemePage from "@/golden/surfaces/theme-page";
import { isLocale } from "@/shared/i18n/settings";

/** Prefixed theme demo (/[locale]/golden-theme). */
export default async function Page({ params }: PageProps<"/[locale]/golden-theme">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <GoldenThemePage />;
}
