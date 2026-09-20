import { T } from "@/components/i18n";
import { cn } from "cn";

/**
 * Starter logo. Light plus dark sources follow the resolved theme; with brand
 * props it renders the mark, otherwise the translated title wordmark, so no
 * brand is ever invented here.
 */
export function AppLogo({
  brandName,
  brandColor,
  lightSrc,
  darkSrc,
  className,
}: {
  brandName?: string;
  brandColor?: string;
  lightSrc?: string;
  darkSrc?: string;
  className?: string;
}) {
  if (lightSrc || darkSrc) {
    return (
      <>
        {lightSrc ? (
          <img src={lightSrc} alt={brandName ?? ""} className={cn("block dark:hidden", className)} />
        ) : null}
        {darkSrc ? (
          <img src={darkSrc} alt={brandName ?? ""} className={cn("hidden dark:block", className)} />
        ) : null}
      </>
    );
  }
  if (!brandName || !brandColor) {
    return (
      <span className={cn("text-lg font-semibold", className)}>
        <T k="app.title" />
      </span>
    );
  }
  const initial = brandName.trim().charAt(0).toUpperCase();
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: brandColor }}
      >
        {initial}
      </span>
      <span className="text-lg font-semibold">{brandName}</span>
    </span>
  );
}
