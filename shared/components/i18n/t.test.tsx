import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "./i18n-provider";
import { T } from "./t";

function renderWithLocale(locale: "en" | "al", ui: React.ReactNode) {
  return render(<I18nProvider locale={locale}>{ui}</I18nProvider>);
}

describe("T", () => {
  it("renders the English string for the key", () => {
    renderWithLocale("en", <T k="welcome" />);

    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("renders the Albanian string for the key", () => {
    renderWithLocale("al", <T k="welcome" />);

    expect(screen.getByText("Mirë se vini")).toBeInTheDocument();
  });

  it("interpolates values into the translation", () => {
    renderWithLocale("al", <T k="hello.user" values={{ name: "Leon" }} />);

    expect(screen.getByText("Përshëndetje, Leon!")).toBeInTheDocument();
  });
});
