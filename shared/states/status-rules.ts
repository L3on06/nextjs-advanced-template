/**
 * Status rule list: the configurable data behind resolveStatus. Rules live in
 * code config, not in a database. Priority order is fixed: global, path,
 * role, permission, feature. First match in config order wins inside one
 * priority. No match yields null (no view) with a dev only warning.
 */

export const STATUS_IDS = [
  "maintenance",
  "offline",
  "no-results",
  "empty",
  "session-expired",
  "verification-required",
  "account-disabled",
  "setup-required",
  "feature-disabled",
] as const;

export type StatusId = (typeof STATUS_IDS)[number];

export type StatusVariant = "loading" | "error" | "warning" | "empty" | "success" | "info";

export type RuleScope = "global" | "path" | "role" | "permission" | "feature";

export type SessionState = "active" | "expired" | "unverified" | "disabled" | "setup-required";

export interface StatusContext {
  path: string;
  roles: string[];
  permissions: string[];
  flags: Record<string, boolean>;
  session: null | { state: SessionState };
  online: boolean;
  content?: "results" | "none";
  query?: string;
}

export interface StatusRule {
  scope: RuleScope;
  status: StatusId;
  match: {
    paths?: { exact?: string[]; prefix?: string[] };
    roles?: string[];
    permissions?: string[];
    flags?: Record<string, boolean>;
    session?: SessionState | "signed-out";
    online?: boolean;
    content?: "results" | "none";
    queryPresent?: boolean;
  };
}

const PRIORITY: RuleScope[] = ["global", "path", "role", "permission", "feature"];

export function priorityOf(scope: RuleScope): number {
  return PRIORITY.indexOf(scope);
}

/** Strip a locale prefix (/en, /al) before path matching. */
export function stripLocale(path: string): string {
  const cleaned = path.replace(/^\/(en|al)(?=\/|$)/, "");
  return cleaned === "" ? "/" : cleaned;
}

function ruleMatches(rule: StatusRule, ctx: StatusContext): boolean {
  const match = rule.match;
  if (match.online !== undefined && ctx.online !== match.online) return false;
  if (match.session !== undefined) {
    if (match.session === "signed-out") {
      if (ctx.session !== null) return false;
    } else if (ctx.session?.state !== match.session) return false;
  }
  if (match.paths !== undefined) {
    const path = stripLocale(ctx.path);
    const exact = match.paths.exact?.includes(path) ?? false;
    const prefix = match.paths.prefix?.some((entry) => path === entry || path.startsWith(`${entry}/`)) ?? false;
    if (!exact && !prefix) return false;
  }
  if (match.roles !== undefined && !match.roles.some((role) => ctx.roles.includes(role))) return false;
  if (match.permissions !== undefined && !match.permissions.some((entry) => ctx.permissions.includes(entry)))
    return false;
  if (match.flags !== undefined) {
    for (const [flag, want] of Object.entries(match.flags)) {
      if ((ctx.flags[flag] ?? false) !== want) return false;
    }
  }
  if (match.content !== undefined && ctx.content !== match.content) return false;
  if (match.queryPresent !== undefined) {
    const present = (ctx.query ?? "").length > 0;
    if (present !== match.queryPresent) return false;
  }
  return true;
}

/**
 * Pure resolver: same inputs give the same status. Session expiry and offline
 * arrive as inputs (session state, online flag), so no network or clock reads.
 * Returns null when nothing matches; the caller renders nothing in that case.
 */
export function resolveStatus(ctx: StatusContext, rules: StatusRule[] = STATUS_RULES): StatusId | null {
  const ordered = [...rules].sort((left, right) => priorityOf(left.scope) - priorityOf(right.scope));
  for (const rule of ordered) {
    if (ruleMatches(rule, ctx)) return rule.status;
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[status] no rule matched for path ${ctx.path}; rendering nothing.`);
  }
  return null;
}

/** Default rule list. Apps append their own path, role, permission, and feature rules. */
export const STATUS_RULES: StatusRule[] = [
  { scope: "global", status: "offline", match: { online: false } },
  { scope: "global", status: "maintenance", match: { flags: { maintenance: true } } },
  { scope: "global", status: "session-expired", match: { session: "expired" } },
  { scope: "global", status: "verification-required", match: { session: "unverified" } },
  { scope: "global", status: "account-disabled", match: { session: "disabled" } },
  { scope: "global", status: "setup-required", match: { session: "setup-required" } },
  { scope: "feature", status: "no-results", match: { content: "none", queryPresent: true } },
  { scope: "feature", status: "empty", match: { content: "none" } },
];

export const STATUS_VARIANTS: Record<StatusId, StatusVariant> = {
  maintenance: "warning",
  offline: "warning",
  "no-results": "empty",
  empty: "empty",
  "session-expired": "info",
  "verification-required": "info",
  "account-disabled": "error",
  "setup-required": "info",
  "feature-disabled": "empty",
};
