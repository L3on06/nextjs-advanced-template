import { NextResponse, type NextRequest } from "next/server";

// Locale routing toggle lives in .env:
// NEXT_PUBLIC_I18N_PREFIX_LOCALE=true  -> /en, /al URLs (redirect + sync cookie)
// anything else                        -> cookie based, URLs stay clean.
// NOTE: keep these constants in sync with shared/i18n/settings.ts. They are
// duplicated here on purpose: proxy runs on the edge before rendering and
// must not import shared application modules.
const LOCALES = ["en", "al"] as const;
type Locale = (typeof LOCALES)[number];

const COOKIE_NAME = "NEXT_LOCALE";
const DEFAULT_LOCALE: Locale =
  process.env.NEXT_PUBLIC_I18N_DEFAULT_LOCALE === "al" ? "al" : "en";
const PREFIX_ENABLED = process.env.NEXT_PUBLIC_I18N_PREFIX_LOCALE === "true";

function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Cookie first, then Accept-Language (sq maps to al), then default. */
function detectLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(COOKIE_NAME)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const header = request.headers.get("accept-language") ?? "";
  const primary = header.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  if (primary === "al" || primary === "sq") return "al";
  if (primary === "en") return "en";

  return DEFAULT_LOCALE;
}

const cookieInit = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };

export function proxy(request: NextRequest) {
  if (!PREFIX_ENABLED) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const hasPrefix = isLocale(segment);

  if (hasPrefix) {
    // Keep the cookie aligned so the root layout renders the right <html lang>.
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, segment, cookieInit);
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE_NAME, locale, cookieInit);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
