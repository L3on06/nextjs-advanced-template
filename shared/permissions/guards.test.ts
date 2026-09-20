import { describe, expect, it } from "vitest";
import {
  canUseFeature,
  canVisitRoute,
  requireOwner,
  requirePermission,
  requireRole,
  visibleNav,
} from "@/shared/permissions/guards";
import type { AuthContext } from "@/shared/permissions/policy";

const anon: AuthContext = { userId: null, roles: [] };
const viewer: AuthContext = { userId: "u1", roles: ["viewer"] };
const editor: AuthContext = { userId: "u2", roles: ["editor"] };
const admin: AuthContext = { userId: "a1", roles: ["admin"] };

describe("route authorization model", () => {
  it("opens public routes to everyone", () => {
    expect(canVisitRoute("home", anon)).toEqual({ ok: true });
    expect(canVisitRoute("signIn", viewer)).toEqual({ ok: true });
  });

  it("gates authenticated routes on session", () => {
    expect(canVisitRoute("dashboard", anon).ok).toBe(false);
    expect(canVisitRoute("dashboard", viewer)).toEqual({ ok: true });
  });

  it("resolves permission routes through grants, not route names", () => {
    expect(canVisitRoute("settings", editor)).toEqual({ ok: true });
    expect(canVisitRoute("settings", viewer).ok).toBe(false);
  });

  it("restricts admin routes to admins and rejects unknown routes", () => {
    expect(canVisitRoute("admin", editor).ok).toBe(false);
    expect(canVisitRoute("admin", admin)).toEqual({ ok: true });
    expect(canVisitRoute("nope", admin).ok).toBe(false);
  });
});

describe("navigation visibility (not security)", () => {
  it("shows admin links to admins only", () => {
    expect(visibleNav(anon)).toEqual(["home"]);
    expect(visibleNav(viewer)).toEqual(["home", "dashboard"]);
    expect(visibleNav(editor)).toEqual(["home", "dashboard", "settings"]);
    expect(visibleNav(admin)).toEqual(["home", "dashboard", "settings", "admin"]);
  });
});

describe("features and server helpers", () => {
  it("gates features by the model", () => {
    expect(canUseFeature("inviteTeammates", editor)).toEqual({ ok: true });
    expect(canUseFeature("inviteTeammates", viewer).ok).toBe(false);
    expect(canUseFeature("userManagement", admin)).toEqual({ ok: true });
  });

  it("denies signed out callers at every server gate", () => {
    expect(requireRole(anon, "viewer").ok).toBe(false);
    expect(requirePermission(anon, "settings:view").ok).toBe(false);
    expect(requireOwner(anon, "u1").ok).toBe(false);
  });

  it("checks roles, permissions, and ownership independently", () => {
    expect(requireRole(editor, "admin").ok).toBe(false);
    expect(requireRole(admin, "admin")).toEqual({ ok: true });
    expect(requirePermission(viewer, "settings:view").ok).toBe(false);
    expect(requireOwner(viewer, "u1")).toEqual({ ok: true });
    expect(requireOwner(viewer, "u2").ok).toBe(false);
  });
});
