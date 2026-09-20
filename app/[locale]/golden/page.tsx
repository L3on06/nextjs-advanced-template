import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/app-page";
import { T } from "@/components/i18n";
import { isLocale } from "@/shared/i18n/settings";

/** Golden index (/[locale]/golden). Links the three demo surfaces. */
export default async function GoldenIndexPage({ params }: PageProps<"/[locale]/golden">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const links = [
    { href: `/${locale}/golden-sign-in`, titleKey: "sign.in.title" },
    { href: `/${locale}/golden-theme`, titleKey: "theme.title" },
    { href: `/${locale}/golden-statuses`, titleKey: "status.wall.title" },
  ] as const;

  return (
    <AppPage titleKey="status.wall.title">
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-primary underline-offset-4 hover:underline">
              <T k={link.titleKey} />
            </Link>
          </li>
        ))}
      </ul>
    </AppPage>
  );
}
