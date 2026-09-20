import { describe, expect, it } from "vitest";
import { al, en } from "./index";

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
}

describe("translation files", () => {
  it("expose the exact same key set in every locale", () => {
    expect(Object.keys(al).sort()).toEqual(Object.keys(en).sort());
  });

  it("hold flat non empty strings only", () => {
    for (const [locale, table] of Object.entries({ en, al })) {
      for (const [key, value] of Object.entries(table)) {
        expect(typeof value, `${locale}.${key}`).toBe("string");
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("use the same interpolation placeholders per key across locales", () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(al[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it("actually translates instead of copying English", () => {
    expect(al.welcome).not.toBe(en.welcome);
    expect(al.language).not.toBe(en.language);
    expect(al.home_hint).not.toBe(en.home_hint);
  });

  it("renders a name through the greeting placeholder", () => {
    expect(en.hello_user).toContain("{{name}}");
    expect(al.hello_user).toContain("{{name}}");
  });
});
