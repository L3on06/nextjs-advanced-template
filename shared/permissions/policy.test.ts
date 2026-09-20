import { describe, expect, it } from "vitest";
import { evaluate, type AuthContext } from "@/shared/permissions/policy";

const anon: AuthContext = { userId: null, roles: [] };
const viewer: AuthContext = { userId: "u1", email: "u1@example.com", roles: ["viewer"] };
const editor: AuthContext = { userId: "u2", email: "u2@example.com", roles: ["editor"] };
const admin: AuthContext = { userId: "a1", email: "a1@example.com", roles: ["admin"] };

describe("base policies", () => {
  it("public allows everyone including signed out", () => {
    expect(evaluate(anon, { kind: "public" })).toBe(true);
  });

  it("authenticated splits signed out from signed in", () => {
    expect(evaluate(anon, { kind: "authenticated" })).toBe(false);
    expect(evaluate(viewer, { kind: "authenticated" })).toBe(true);
  });

  it("deny blocks even admins", () => {
    expect(evaluate(admin, { kind: "deny" })).toBe(false);
  });
});

describe("ownership", () => {
  const ownerPolicy = { kind: "owner", param: "userId" } as const;
  it("allows the owner via path params", () => {
    expect(evaluate({ ...viewer, params: { userId: "u1" } }, ownerPolicy)).toBe(true);
  });
  it("denies strangers and signed out callers", () => {
    expect(evaluate({ ...editor, params: { userId: "u1" } }, ownerPolicy)).toBe(false);
    expect(evaluate({ ...anon, params: { userId: "u1" } }, ownerPolicy)).toBe(false);
  });
});

describe("roles and permissions", () => {
  it("grants admin only gates to admins", () => {
    expect(evaluate(viewer, { kind: "roles", roles: ["admin"] })).toBe(false);
    expect(evaluate(admin, { kind: "roles", roles: ["admin"] })).toBe(true);
  });
  it("resolves permissions through the grant map", () => {
    expect(evaluate(editor, { kind: "permission", permission: "settings:view" })).toBe(true);
    expect(evaluate(viewer, { kind: "permission", permission: "settings:view" })).toBe(false);
    expect(evaluate(admin, { kind: "permission", permission: "users:manage" })).toBe(true);
  });
});

describe("create, update, and status transitions", () => {
  it("enforces fixed shape values on create", () => {
    const shape = {
      kind: "createShape",
      requiredKeys: ["uid", "roles"],
      fixedValues: { uid: "{userId}", roles: ["viewer"] },
    } as const;
    const ok = { ...viewer, params: { userId: "u1" }, next: { uid: "u1", roles: ["viewer"] } };
    const escalated = { ...viewer, params: { userId: "u1" }, next: { uid: "u1", roles: ["admin"] } };
    expect(evaluate(ok, shape)).toBe(true);
    expect(evaluate(escalated, shape)).toBe(false);
  });

  it("detects changed frozen fields on update", () => {
    const frozen = { kind: "unchanged", fields: ["roles"] } as const;
    const same = { ...viewer, resource: { roles: ["viewer"] }, next: { roles: ["viewer"] } };
    const changed = { ...viewer, resource: { roles: ["viewer"] }, next: { roles: ["admin"] } };
    expect(evaluate(same, frozen)).toBe(true);
    expect(evaluate(changed, frozen)).toBe(false);
  });

  it("allows only the pending to accepted transition with frozen fields", () => {
    const transition = {
      kind: "statusTransition",
      field: "status",
      from: "pending",
      to: "accepted",
      frozenFields: ["email", "role"],
    } as const;
    const accept = {
      ...editor,
      resource: { status: "pending", email: "x@y.z", role: "viewer" },
      next: { status: "accepted", email: "x@y.z", role: "viewer" },
    };
    const tampered = {
      ...editor,
      resource: { status: "pending", email: "x@y.z", role: "viewer" },
      next: { status: "accepted", email: "x@y.z", role: "admin" },
    };
    const wrongFrom = {
      ...editor,
      resource: { status: "accepted", email: "x@y.z", role: "viewer" },
      next: { status: "accepted", email: "x@y.z", role: "viewer" },
    };
    expect(evaluate(accept, transition)).toBe(true);
    expect(evaluate(tampered, transition)).toBe(false);
    expect(evaluate(wrongFrom, transition)).toBe(false);
  });

  it("matches invitees by email, not uid", () => {
    const policy = { kind: "emailMatch", field: "email" } as const;
    const invitee = { ...viewer, resource: { email: "u1@example.com" } };
    const other = { ...editor, resource: { email: "u1@example.com" } };
    expect(evaluate(invitee, policy)).toBe(true);
    expect(evaluate(other, policy)).toBe(false);
  });
});
