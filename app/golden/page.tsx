import Link from "next/link";
import { AppPage } from "@/components/app/app-page";

const LINKS = [
  { href: "/golden-sign-in", titleKey: "sign_in_title" },
  { href: "/golden-theme", titleKey: "theme_title" },
  { href: "/golden-statuses", titleKey: "status_wall_title" },
] as const;

/** Golden index: links to the three demo surfaces. */
export default function GoldenIndexPage() {
  return (
    <AppPage titleKey="status_wall_title">
      <ul>
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.href}</Link>
          </li>
        ))}
      </ul>
    </AppPage>
  );
}
