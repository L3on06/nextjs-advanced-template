import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppState } from "@/components/app/app-state";
import { I18nProvider } from "@/components/i18n";
import type { StatusVariant } from "@/shared/states/status-rules";

const VARIANTS: StatusVariant[] = ["loading", "error", "warning", "empty", "success", "info"];

function renderState(ui: React.ReactNode) {
  return render(<I18nProvider locale="en">{ui}</I18nProvider>);
}

describe("AppState", () => {
  it.each(VARIANTS)("renders the %s variant with title and message", (variant) => {
    renderState(<AppState variant={variant} titleKey="status.empty.title" messageKey="status.empty.message" />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("New items will appear in this space.")).toBeInTheDocument();
  });

  it("announces errors assertively and other views politely", () => {
    const { unmount } = renderState(<AppState variant="error" titleKey="status.empty.title" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    unmount();
    renderState(<AppState variant="info" titleKey="status.empty.title" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("runs the action handler on click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderState(
      <AppState variant="empty" titleKey="status.empty.title" action={{ labelKey: "action.retry", onClick }} />,
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders link actions as anchors", () => {
    renderState(
      <AppState variant="info" titleKey="status.empty.title" action={{ labelKey: "action.sign.in", href: "/sign-in" }} />,
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
  });
});
