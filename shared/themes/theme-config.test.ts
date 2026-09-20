import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALES,
  DEFAULT_THEME,
  PRIMARY_SWATCHES,
  type ThemeConfig,
} from "@/shared/themes/theme-config";

describe("theme config", () => {
  it("ships valid defaults inside the closed sets", () => {
    const theme: ThemeConfig = DEFAULT_THEME;
    expect(PRIMARY_SWATCHES).toContain(theme.primary);
    expect(theme.animation.easing).toBe("ease-out");
  });

  it("rejects values outside the closed sets at build time", () => {
    // @ts-expect-error primary must come from the swatch list, never free hex
    const bad: ThemeConfig = { ...DEFAULT_THEME, primary: "#ff0000" };
    expect(bad.primary).toBe("#ff0000");
  });

  it("locks prefixed routing with message paths per locale", () => {
    expect(DEFAULT_LOCALES.routing).toBe("prefixed");
    expect(DEFAULT_LOCALES.messagePaths.en).toContain("en.json");
    expect(DEFAULT_LOCALES.messagePaths.al).toContain("al.json");
  });
});
