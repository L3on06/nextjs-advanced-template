import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockCookies } = vi.hoisted(() => ({ mockCookies: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: mockCookies }));

import { getServerLocale, getT } from "./server";
import type { TranslationKey } from "../translations";

describe("getServerLocale", () => {
  beforeEach(() => {
    mockCookies.mockReset();
  });

  it("reads the locale from the request cookie", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "al" }) });

    await expect(getServerLocale()).resolves.toBe("al");
  });

  it("falls back to English when no cookie is set", async () => {
    mockCookies.mockResolvedValue({ get: () => undefined });

    await expect(getServerLocale()).resolves.toBe("en");
  });

  it("falls back to English when the cookie holds an unknown locale", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "fr" }) });

    await expect(getServerLocale()).resolves.toBe("en");
  });
});

describe("getT", () => {
  it("translates a key for the requested locale", async () => {
    const { t } = await getT("al");

    expect(t("welcome")).toBe("Mirë se vini");
  });

  it("interpolates values into the translation", async () => {
    const { t } = await getT("en");

    expect(t("hello_user", { name: "Leon" })).toBe("Hello, Leon!");
  });

  it("returns the key itself when a translation is missing", async () => {
    const { t } = await getT("en");

    // Cast away from the typed keys on purpose: this asserts runtime fallback.
    expect(t("no_such_key" as TranslationKey)).toBe("no_such_key");
  });
});
