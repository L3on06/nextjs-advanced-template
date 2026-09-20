import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/shared/i18n/settings";

/**
 * Prefix-mode entry (/). Canonical routes live under /[locale]; this address
 * only forwards to the default locale. See docs/MIGRATION.md.
 */
export default function Home() {
  redirect(`/${DEFAULT_LOCALE}`);
}
