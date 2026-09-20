import { describe, expect, it } from "vitest";
import type { TranslationKey } from "../translations";
import { createClientI18n } from "./client";

describe("createClientI18n", () => {
  it("translates a key for the requested locale", () => {
    expect(createClientI18n("al").t("welcome")).toBe("Mirë se vini");
    expect(createClientI18n("en").t("welcome")).toBe("Welcome");
  });

  it("interpolates values into the translation", () => {
    expect(createClientI18n("en").t("hello_user", { name: "Leon" })).toBe(
      "Hello, Leon!",
    );
    expect(createClientI18n("al").t("hello_user", { name: "Leon" })).toBe(
      "Përshëndetje, Leon!",
    );
  });

  it("returns the key itself when a translation is missing", () => {
    // Cast away from the typed keys on purpose: this asserts runtime fallback.
    expect(createClientI18n("en").t("no_such_key" as TranslationKey)).toBe(
      "no_such_key",
    );
  });

  it("builds an independent instance per call", () => {
    const first = createClientI18n("en");
    const second = createClientI18n("al");

    expect(first).not.toBe(second);
    expect(first.t("welcome")).toBe("Welcome");
    expect(second.t("welcome")).toBe("Mirë se vini");
  });

  it("treats dotted keys as flat strings, never as paths", () => {
    expect(createClientI18n("en").t("home.hint" as TranslationKey)).toBe(
      "home.hint",
    );
  });
});
