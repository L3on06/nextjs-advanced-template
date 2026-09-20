import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppState } from "@/components/app/app-state";
import { I18nProvider } from "@/components/i18n";
import { resolveAppState } from "@/shared/states/resolve-app-state";
import type { StatusContext } from "@/shared/states/status-rules";

describe("status chain", () => {
  it("maps a maintenance flag to a translated warning view", () => {
    const ctx: StatusContext = {
      path: "/",
      roles: [],
      permissions: [],
      flags: { maintenance: true },
      session: { state: "active" },
      online: true,
    };
    const resolved = resolveAppState(ctx, undefined, { labelKey: "action_retry" });
    expect(resolved?.variant).toBe("warning");
    expect(resolved?.titleKey).toBe("status_maintenance_title");
    render(
      <I18nProvider locale="en">
        <AppState variant={resolved!.variant} titleKey={resolved!.titleKey} messageKey={resolved!.messageKey} action={resolved!.action} />
      </I18nProvider>,
    );
    expect(screen.getByText("Under maintenance")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("returns null when nothing matches", () => {
    const ctx: StatusContext = {
      path: "/",
      roles: [],
      permissions: [],
      flags: {},
      session: { state: "active" },
      online: true,
      content: "results",
    };
    expect(resolveAppState(ctx)).toBeNull();
  });
});
