import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, refresh: navigation.refresh }),
  usePathname: () => navigation.pathname,
}));

import {
  I18nProvider,
  useChangeLocale,
  useLocale,
} from "./i18n-provider";

function Probe() {
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  return (
    <>
      <p>active: {locale}</p>
      <button type="button" onClick={() => changeLocale("al")}>
        switch
      </button>
    </>
  );
}

afterEach(() => {
  navigation.push.mockClear();
  navigation.refresh.mockClear();
  navigation.pathname = "/";
  document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
  document.documentElement.lang = "en";
});

describe("I18nProvider", () => {
  it("renders children with the requested locale", () => {
    render(
      <I18nProvider locale="al">
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByText("active: al")).toBeInTheDocument();
  });

  it("sets the document language to the active locale", () => {
    const { rerender } = render(
      <I18nProvider locale="en">
        <Probe />
      </I18nProvider>,
    );
    expect(document.documentElement.lang).toBe("en");

    rerender(
      <I18nProvider locale="al">
        <Probe />
      </I18nProvider>,
    );
    expect(document.documentElement.lang).toBe("al");
  });

  it("lets a nested provider own the document language", () => {
    render(
      <I18nProvider locale="en">
        <I18nProvider locale="al">
          <Probe />
        </I18nProvider>
      </I18nProvider>,
    );

    expect(screen.getByText("active: al")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("al");
  });

  it("persists the choice in a cookie and refreshes in cookie mode", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="en">
        <Probe />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "switch" }));

    expect(document.cookie).toContain("NEXT_LOCALE=al");
    expect(navigation.refresh).toHaveBeenCalledTimes(1);
    expect(navigation.push).not.toHaveBeenCalled();
    expect(await screen.findByText("active: al")).toBeInTheDocument();
  });

  it("navigates to the prefixed URL in prefix mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_I18N_PREFIX_LOCALE", "true");
    vi.resetModules();
    try {
      const fresh = await import("./i18n-provider");
      function FreshProbe() {
        const changeLocale = fresh.useChangeLocale();
        return (
          <button type="button" onClick={() => changeLocale("al")}>
            switch
          </button>
        );
      }
      const user = userEvent.setup();
      render(
        <fresh.I18nProvider locale="en">
          <FreshProbe />
        </fresh.I18nProvider>,
      );

      await user.click(screen.getByRole("button", { name: "switch" }));

      expect(navigation.push).toHaveBeenCalledWith("/al");
      expect(document.cookie).toContain("NEXT_LOCALE=al");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
