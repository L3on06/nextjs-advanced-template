import { notFound } from "next/navigation";
import GoldenStatusWallPage from "@/golden/surfaces/status-wall-page";
import { isLocale } from "@/shared/i18n/settings";

/** Prefixed status wall demo (/[locale]/golden-statuses). */
export default async function Page({ params }: PageProps<"/[locale]/golden-statuses">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <GoldenStatusWallPage />;
}
