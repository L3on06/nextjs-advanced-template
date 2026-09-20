import { describe, expect, it, vi } from "vitest";
import {
  STATUS_IDS,
  STATUS_RULES,
  STATUS_VARIANTS,
  resolveStatus,
  stripLocale,
  type StatusContext,
  type StatusRule,
} from "@/shared/states/status-rules";

const BASE: StatusContext = {
  path: "/dashboard",
  roles: ["viewer"],
  permissions: [],
  flags: {},
  session: { state: "active" },
  online: true,
};

describe("resolveStatus", () => {
  it("renders nothing when no rule matches", () => {
    expect(resolveStatus(BASE)).toBeNull();
  });

  it("maps global rules first: offline beats maintenance", () => {
    const ctx: StatusContext = { ...BASE, online: false, flags: { maintenance: true } };
    expect(resolveStatus(ctx)).toBe("offline");
  });

  it("maps session states in config order", () => {
    expect(resolveStatus({ ...BASE, session: { state: "expired" } })).toBe("session-expired");
    expect(resolveStatus({ ...BASE, session: { state: "unverified" } })).toBe("verification-required");
    expect(resolveStatus({ ...BASE, session: { state: "disabled" } })).toBe("account-disabled");
    expect(resolveStatus({ ...BASE, session: { state: "setup-required" } })).toBe("setup-required");
  });

  it("prefers path over role, role over permission, permission over feature", () => {
    const rules: StatusRule[] = [
      { scope: "feature", status: "feature-disabled", match: { flags: { beta: false } } },
      { scope: "permission", status: "account-disabled", match: { permissions: ["users:manage"] } },
      { scope: "role", status: "verification-required", match: { roles: ["viewer"] } },
      { scope: "path", status: "maintenance", match: { paths: { prefix: ["/dashboard"] } } },
    ];
    const ctx: StatusContext = {
      ...BASE,
      permissions: ["users:manage"],
      flags: { beta: false },
    };
    expect(resolveStatus(ctx, rules)).toBe("maintenance");
  });

  it("breaks ties by config order inside one priority", () => {
    const rules: StatusRule[] = [
      { scope: "path", status: "maintenance", match: { paths: { prefix: ["/dashboard"] } } },
      { scope: "path", status: "offline", match: { paths: { prefix: ["/dashboard/settings"] } } },
    ];
    const ctx: StatusContext = { ...BASE, path: "/dashboard/settings" };
    expect(resolveStatus(ctx, rules)).toBe("maintenance");
  });

  it("strips locale prefixes before path matching", () => {
    expect(stripLocale("/en/dashboard")).toBe("/dashboard");
    expect(stripLocale("/al")).toBe("/");
    const rules: StatusRule[] = [{ scope: "path", status: "maintenance", match: { paths: { exact: ["/dashboard"] } } }];
    expect(resolveStatus({ ...BASE, path: "/en/dashboard" }, rules)).toBe("maintenance");
  });

  it("maps content states to no-results and empty", () => {
    expect(resolveStatus({ ...BASE, content: "none", query: "x" })).toBe("no-results");
    expect(resolveStatus({ ...BASE, content: "none" })).toBe("empty");
    expect(resolveStatus({ ...BASE, content: "results" })).toBeNull();
  });

  it("warns in development on no match", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveStatus(BASE, []);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("covers all nine statuses with a view each", () => {
    expect(STATUS_IDS).toHaveLength(9);
    for (const id of STATUS_IDS) {
      expect(STATUS_VARIANTS[id]).toBeDefined();
    }
    expect(STATUS_RULES.length).toBeGreaterThan(0);
  });
});
