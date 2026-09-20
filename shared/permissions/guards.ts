import {
  AUTHZ_CONFIG,
  type Permission,
  type Role,
} from "@/shared/permissions/config";
import { evaluate, type AuthContext } from "@/shared/permissions/policy";

/**
 * Route guards, navigation visibility, and server authorization helpers.
 * All three compile from the same config through the same evaluator.
 *
 * Guards are convenience, not security: every guarded entry must still be
 * enforced by generated Firestore/Storage rules or by a server side check
 * below. Client navigation hiding is never an access control.
 */

export type Verdict = { ok: true } | { ok: false; reason: string };

const deny = (reason: string): Verdict => ({ ok: false, reason });

function verdictFor(allowed: boolean, reason: string): Verdict {
  return allowed ? { ok: true } : deny(reason);
}

/** Route reachability for a context. Data access is decided separately. */
export function canVisitRoute(routeName: string, ctx: AuthContext): Verdict {
  const route = AUTHZ_CONFIG.routes.find((entry) => entry.name === routeName);
  if (!route) return deny(`unknown route: ${routeName}`);
  return verdictFor(evaluate(ctx, route.access), `route ${routeName} denied`);
}

/** Navigation visibility for a context. Hiding is not protection. */
export function visibleNav(ctx: AuthContext): string[] {
  return AUTHZ_CONFIG.navigation.filter((item) => evaluate(ctx, item.visibility)).map((item) => item.key);
}

/** Named feature access for a context. */
export function canUseFeature(featureName: string, ctx: AuthContext): Verdict {
  const feature = AUTHZ_CONFIG.features.find((entry) => entry.name === featureName);
  if (!feature) return deny(`unknown feature: ${featureName}`);
  return verdictFor(evaluate(ctx, feature.access), `feature ${featureName} denied`);
}

/** Server side role gate. Recheck at the entry even behind a guarded page. */
export function requireRole(ctx: AuthContext, role: Role): Verdict {
  if (!ctx.userId) return deny("signed out");
  return verdictFor(ctx.roles.includes(role), `role ${role} required`);
}

/** Server side permission gate. */
export function requirePermission(ctx: AuthContext, permission: Permission): Verdict {
  if (!ctx.userId) return deny("signed out");
  const granted = AUTHZ_CONFIG.grants[permission] ?? [];
  return verdictFor(ctx.roles.some((role) => granted.includes(role)), `permission ${permission} required`);
}

/** Server side ownership gate for a resource id in hand. */
export function requireOwner(ctx: AuthContext, ownerId: string): Verdict {
  if (!ctx.userId) return deny("signed out");
  return verdictFor(ctx.userId === ownerId, "owner required");
}
