import {
  PERMISSION_GRANTS,
  type Permission,
  type Policy,
  type Role,
} from "@/shared/permissions/config";

/**
 * Pure authorization evaluation. No IO, no Firebase, no framework: every
 * guard, generator, and test reads this module, so the model cannot drift
 * between platforms.
 */

export interface AuthContext {
  userId: string | null;
  email?: string | null;
  roles: Role[];
  params?: Record<string, string>;
  resource?: Record<string, unknown>;
  next?: Record<string, unknown>;
}

export const signedIn = (ctx: AuthContext): boolean => ctx.userId !== null;

export function hasRole(ctx: AuthContext, role: Role): boolean {
  return ctx.roles.includes(role);
}

export function hasPermission(ctx: AuthContext, permission: Permission): boolean {
  const granted = PERMISSION_GRANTS[permission] ?? [];
  return ctx.roles.some((role) => granted.includes(role));
}

/**
 * Evaluate a policy against a context. `params` supplies path values for
 * owner checks; `resource`/`next` supply current and incoming documents for
 * shape, frozen field, and status transition checks.
 */
export function evaluate(ctx: AuthContext, policy: Policy): boolean {
  switch (policy.kind) {
    case "public":
      return true;
    case "authenticated":
      return signedIn(ctx);
    case "deny":
      return false;
    case "owner":
      return signedIn(ctx) && ctx.params?.[policy.param] === ctx.userId;
    case "roles":
      return signedIn(ctx) && policy.roles.some((role) => hasRole(ctx, role));
    case "permission":
      return signedIn(ctx) && hasPermission(ctx, policy.permission);
    case "unchanged":
      return policy.fields.every(
        (field) => JSON.stringify(ctx.resource?.[field]) === JSON.stringify(ctx.next?.[field]),
      );
    case "emailMatch":
      return signedIn(ctx) && ctx.email != null && ctx.resource?.[policy.field] === ctx.email;
    case "createShape": {
      if (!signedIn(ctx) || !ctx.next) return false;
      const keys = Object.keys(ctx.next);
      if (!policy.requiredKeys.every((key) => keys.includes(key))) return false;
      return Object.entries(policy.fixedValues).every(([field, expected]) => {
        const actual = ctx.next?.[field];
        const want =
          typeof expected === "string" && expected.startsWith("{") && expected.endsWith("}")
            ? ctx.params?.[expected.slice(1, -1)]
            : expected;
        return JSON.stringify(actual) === JSON.stringify(want);
      });
    }
    case "statusTransition": {
      if (!signedIn(ctx) || !ctx.resource || !ctx.next) return false;
      if (ctx.resource[policy.field] !== policy.from) return false;
      if (ctx.next[policy.field] !== policy.to) return false;
      return policy.frozenFields.every((field) => ctx.resource?.[field] === ctx.next?.[field]);
    }
    case "all":
      return policy.policies.every((child) => evaluate(ctx, child));
    case "any":
      return policy.policies.some((child) => evaluate(ctx, child));
  }
}
