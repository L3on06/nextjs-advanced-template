import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, refresh: navigation.refresh }),
  usePathname: () => "/",
}));

import { I18nProvider } from "./i18n-provider";
import { LanguageSwitcher } from "./language-switcher";

function renderSwitcher(locale: "en" | "al") {
  return render(
    <I18nProvider locale={locale}>
      <LanguageSwitcher />
    </I18nProvider>,
  );
}

afterEach(() => {
  navigation.push.mockClear();
  navigation.refresh.mockClear();
  document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
});

describe("LanguageSwitcher", () => {
  it("shows the active locale behind an accessible name", () => {
    renderSwitcher("en");

    const trigger = screen.getByRole("button", { name: "Language" });
    expect(trigger.textContent?.toLowerCase()).toContain("en");
  });

  it("opens with the mouse and lists every language in its own language", async () => {
    const user = userEvent.setup();
    renderSwitcher("en");

    await user.click(screen.getByRole("button", { name: "Language" }));

    expect(
      await screen.findByRole("menuitem", { name: "English" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Shqip" }),
    ).toBeInTheDocument();
  });

  it("opens with the keyboard", async () => {
    const user = userEvent.setup();
    renderSwitcher("en");

    await user.tab();
    expect(screen.getByRole("button", { name: "Language" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("menuitem", { name: "Shqip" }),
    ).toBeInTheDocument();
  });

  it("switches language, persists it, and refreshes", async () => {
    const user = userEvent.setup();
    renderSwitcher("en");

    await user.click(screen.getByRole("button", { name: "Language" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Shqip" }),
    );

    expect(document.cookie).toContain("NEXT_LOCALE=al");
    expect(navigation.refresh).toHaveBeenCalledTimes(1);
    const trigger = await screen.findByRole("button", { name: "Gjuha" });
    expect(trigger.textContent?.toLowerCase()).toContain("al");
  });

  it("marks the active language and ignores reselecting it", async () => {
    const user = userEvent.setup();
    renderSwitcher("al");

    await user.click(screen.getByRole("button", { name: "Gjuha" }));
    const active = await screen.findByRole("menuitem", { name: "Shqip" });
    expect(active).toBeInTheDocument();
    await user.click(active);

    expect(navigation.refresh).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("NEXT_LOCALE=");
  });
});
