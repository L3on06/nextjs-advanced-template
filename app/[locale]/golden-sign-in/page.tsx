import { notFound } from "next/navigation";
import GoldenSignInPage from "@/golden/surfaces/sign-in-page";
import { isLocale } from "@/shared/i18n/settings";

/** Prefixed sign in demo (/[locale]/golden-sign-in). */
export default async function Page({ params }: PageProps<"/[locale]/golden-sign-in">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <GoldenSignInPage />;
}
