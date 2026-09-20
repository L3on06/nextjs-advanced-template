import { describe, expect, it } from "vitest";
import {
  COOKIE_NAME,
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  LOCALE_META,
  PREFIX_ENABLED,
  stripLocalePrefix,
} from "./settings";

describe("isLocale", () => {
  it("accepts the supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("al")).toBe(true);
  });

  it("rejects unknown, empty, and non string values", () => {
    expect(isLocale("sq")).toBe(false);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});

describe("stripLocalePrefix", () => {
  it("splits a prefixed pathname into locale and rest", () => {
    expect(stripLocalePrefix("/en/about")).toEqual({
      locale: "en",
      pathnameWithoutLocale: "/about",
    });
  });

  it("treats a bare locale segment as the site root", () => {
    expect(stripLocalePrefix("/al")).toEqual({
      locale: "al",
      pathnameWithoutLocale: "/",
    });
  });

  it("leaves unprefixed and unknown prefix pathnames untouched", () => {
    expect(stripLocalePrefix("/")).toEqual({
      locale: null,
      pathnameWithoutLocale: "/",
    });
    expect(stripLocalePrefix("/about")).toEqual({
      locale: null,
      pathnameWithoutLocale: "/about",
    });
    expect(stripLocalePrefix("/fr/about")).toEqual({
      locale: null,
      pathnameWithoutLocale: "/fr/about",
    });
  });

  it("handles an empty pathname as the site root", () => {
    expect(stripLocalePrefix("")).toEqual({
      locale: null,
      pathnameWithoutLocale: "/",
    });
  });
});

describe("locale configuration", () => {
  it("supports English and Albanian", () => {
    expect([...LOCALES]).toEqual(["en", "al"]);
  });

  it("labels each language in its own language", () => {
    expect(LOCALE_META.en.label).toBe("English");
    expect(LOCALE_META.al.label).toBe("Shqip");
  });

  it("maps each locale to a flag icons country code", () => {
    expect(LOCALE_META.en.flag).toBe("gb");
    expect(LOCALE_META.al.flag).toBe("al");
  });

  it("defaults to cookie routing with English as fallback", () => {
    expect(PREFIX_ENABLED).toBe(false);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("stores the locale under the shared cookie name", () => {
    expect(COOKIE_NAME).toBe("NEXT_LOCALE");
  });
});
