import { T } from "@/components/i18n";
import { cn } from "cn";

/**
 * Starter logo. Optional brand name plus brand color; without them it renders
 * the translated app title as a wordmark, so no brand is ever invented here.
 */
export function AppLogo({
  brandName,
  brandColor,
  className,
}: {
  brandName?: string;
  brandColor?: string;
  className?: string;
}) {
  if (!brandName || !brandColor) {
    return (
      <span className={cn("text-lg font-semibold", className)}>
        <T k="app_title" />
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
