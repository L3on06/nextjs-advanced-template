import { HomePage } from "@/components/home-page";
import { getServerLocale } from "@/shared/i18n/server";

/** Cookie-mode home (/). Same content as /[locale], resolved from the cookie. */
export default async function Home() {
  const locale = await getServerLocale();

  return <HomePage locale={locale} />;
}
