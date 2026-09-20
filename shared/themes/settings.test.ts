import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SETTINGS,
  getThemeSettings,
  setThemeSettings,
  subscribeTheme,
} from "@/shared/themes/settings";

describe("settings API", () => {
  it("reads defaults outside the browser with no source mutation", () => {
    expect(getThemeSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("rejects values outside the closed sets", () => {
    expect(() => setThemeSettings({ mode: "neon" as never })).toThrow(/Unknown theme mode/);
    expect(() => setThemeSettings({ density: "tight" as never })).toThrow(/Unknown density/);
    expect(() => setThemeSettings({ primary: "#ff0000" as never })).toThrow(/Unknown primary/);
  });

  it("notifies subscribers on change", () => {
    const seen: string[] = [];
    const stop = subscribeTheme((settings) => seen.push(settings.density));
    window.dispatchEvent(new CustomEvent("theme-settings", { detail: { ...DEFAULT_SETTINGS, density: "compact" } }));
    stop();
    expect(seen).toEqual(["compact"]);
  });

  it("writes and reads back through storage when available", () => {
    const listener = vi.fn();
    const stop = subscribeTheme(listener);
    const next = setThemeSettings({ density: "compact" });
    expect(next.density).toBe("compact");
    expect(getThemeSettings().density).toBe("compact");
    expect(listener).toHaveBeenCalledTimes(1);
    setThemeSettings({ density: "comfortable" });
    stop();
  });
});
