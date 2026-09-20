import { z } from "zod";
import type { FirestoreResource, Policy, Role, StorageResource } from "../../shared/permissions/config";
import type { StepDef } from "../types";
import { fileMatches, overridesMerge, readJsonFile } from "./helpers";

/**
 * Steps 15-21: authorization model slice. These steps write sections of
 * shared/permissions/overrides.json, which the permissions compiler layers
 * over the base config. Routes never imply data access: route and navigation
 * policies compile to guards and visibility only.
 */

function overridesSection(targetDir: string, section: string): unknown {
  const current = readJsonFile(targetDir, "shared/permissions/overrides.json") as Record<
    string,
    unknown
  > | null;
  return current?.[section];
}

const KnownRole = z.enum(["viewer", "editor", "admin"]);

export const rolesStep: StepDef = {
  id: "roles",
  title: "Roles",
  schema: z.object({
    roles: z.array(KnownRole).min(2).default(["viewer", "editor", "admin"]),
  }).refine((value) => value.roles.includes("admin") && value.roles.includes("viewer"), {
    message: "the admin and viewer roles are structural and cannot be removed",
  }),
  ui: {
    title: "Roles",
    description: "Which of the starter roles this app uses. Admin and viewer are structural.",
    fields: [{ name: "roles", label: "Enabled roles", type: "multiselect", options: ["viewer", "editor", "admin"] }],
  },
  docs: "Selects the role vocabulary from the known starter roles. Admin and viewer are structural (rules and seed flows reference them). Custom roles are out of scope for the starter: model them as permissions, not new roles.",
  detect: (targetDir, values) => {
    const section = overridesSection(targetDir, "roles");
    const ok = section != null && JSON.stringify(section) === JSON.stringify(values["roles"]);
    return ok
      ? { status: "current", detail: "roles match" }
      : { status: "missing", detail: "roles missing or stale" };
  },
  generate: (ctx) => [overridesMerge(ctx.targetDir, "roles", ctx.values["roles"])],
};

const BASE_GRANTS: Record<string, ("viewer" | "editor" | "admin")[]> = {
  "profile:read": ["viewer", "editor", "admin"],
  "profile:write": ["viewer", "editor", "admin"],
  "users:read": ["admin"],
  "users:manage": ["admin"],
  "invites:manage": ["editor", "admin"],
  "settings:view": ["editor", "admin"],
};

export const permissionsStep: StepDef = {
  id: "permissions",
  title: "Permissions",
  schema: z.object({
    grants: z.record(z.string(), z.array(KnownRole)).default(BASE_GRANTS),
  }).refine((value) => (value.grants["users:manage"] ?? []).includes("admin"), {
    message: "users:manage must always include admin (system invariant)",
  }),
  ui: {
    title: "Permission grants",
    description: "Narrow which roles hold each permission. users:manage always keeps admin.",
    fields: [{ name: "grants", label: "Grants (permission to roles)", type: "text", help: "JSON object mapping permission names to role arrays" }],
  },
  docs: "Narrows permission grants per app. Every permission keeps at least its default holders implicitly by starting from the base map; users:manage must retain admin or user recovery becomes impossible. Compiles into guards, rules role lookups, and the permission matrix doc.",
  detect: (targetDir, values) => {
    const section = overridesSection(targetDir, "grants");
    const ok = section != null && JSON.stringify(section) === JSON.stringify(values["grants"]);
    return ok
      ? { status: "current", detail: "grants match" }
      : { status: "missing", detail: "grants missing or stale" };
  },
  generate: (ctx) => [overridesMerge(ctx.targetDir, "grants", ctx.values["grants"])],
};

const ExtraCollectionSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, "lowercase collection name"),
  ownerParam: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, "param name"),
});

export const resourcesStep: StepDef = {
  id: "resources",
  title: "Resources",
  schema: z.object({
    extraCollections: z.array(ExtraCollectionSchema).default([]),
    extraFolders: z
      .array(z.object({ name: z.string().min(1), ownerParam: z.string().min(1) }))
      .default([]),
  }),
  ui: {
    title: "Extra resources",
    description: "Additional owner scoped collections and storage folders. Starter users and invites always exist.",
    fields: [
      { name: "extraCollections", label: "Extra collections (JSON)", type: "text", help: '[{"name":"orders","ownerParam":"ownerId"}]' },
      { name: "extraFolders", label: "Extra storage folders (JSON)", type: "text", help: '[{"name":"receipts","ownerParam":"userId"}]' },
    ],
  },
  docs: "Declares extra owner scoped resources. Each collection compiles to deny by default rules (owner plus admin reads, owner writes, admin deletes); each folder compiles to owner only storage rules with the starter size cap. Business field modeling stays in features; this step only opens the gates.",
  detect: (targetDir, values) => {
    const firestore = (overridesSection(targetDir, "firestore") ?? []) as FirestoreResource[];
    const storage = (overridesSection(targetDir, "storage") ?? []) as StorageResource[];
    const collections = values["extraCollections"] as { name: string }[];
    const folders = values["extraFolders"] as { name: string }[];
    const ok =
      collections.every((entry) => firestore.some((resource) => resource.collection === entry.name)) &&
      folders.every((entry) => storage.some((resource) => resource.name === entry.name));
    return ok
      ? { status: "current", detail: "resources present" }
      : { status: "missing", detail: "resources missing or stale" };
  },
  generate: (ctx) => {
    const collections = ctx.values["extraCollections"] as { name: string; ownerParam: string }[];
    const folders = ctx.values["extraFolders"] as { name: string; ownerParam: string }[];
    return [
      overridesMerge(ctx.targetDir, "firestore", buildFirestore(collections)),
      overridesMerge(ctx.targetDir, "storage", buildStorage(folders)),
    ];
  },
};

function buildFirestore(collections: { name: string; ownerParam: string }[]): FirestoreResource[] {
  return collections.map((entry) => ({
    collection: entry.name,
    path: `${entry.name}/{docId}`,
    pathParams: ["docId"],
    policies: {
      get: {
        kind: "any",
        policies: [
          { kind: "owner", param: entry.ownerParam },
          { kind: "roles", roles: ["admin"] },
        ],
      },
      list: { kind: "deny" },
      create: { kind: "owner", param: entry.ownerParam },
      update: { kind: "owner", param: entry.ownerParam },
      delete: { kind: "roles", roles: ["admin"] },
    },
  }));
}

function buildStorage(folders: { name: string; ownerParam: string }[]): StorageResource[] {
  return folders.map((entry) => ({
    name: entry.name,
    path: `${entry.name}/{${entry.ownerParam}}/{filePath=**}`,
    pathParams: [entry.ownerParam],
    read: { kind: "owner", param: entry.ownerParam },
    write: { kind: "owner", param: entry.ownerParam },
    maxSizeBytes: 10 * 1024 * 1024,
  }));
}

const ExtraRouteSchema = z.object({
  name: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "route name"),
  path: z.string().regex(/^\/[a-z0-9/-]*$/, "absolute path"),
  access: z.enum(["public", "authenticated", "admin"]),
});

export const routesStep: StepDef = {
  id: "routes",
  title: "Routes",
  schema: z.object({
    extraRoutes: z.array(ExtraRouteSchema).default([]),
  }),
  ui: {
    title: "Extra routes",
    description: "App routes beyond the starter set. Access is reachability only, never data access.",
    fields: [{ name: "extraRoutes", label: "Extra routes (JSON)", type: "text", help: '[{"name":"billing","path":"/billing","access":"authenticated"}]' }],
  },
  docs: "Registers extra named routes with reachability policies. Public, authenticated, or admin only. Route access never implies Firestore or Storage access; guards recheck and rules enforce independently.",
  detect: (targetDir, values) => {
    const routes = (overridesSection(targetDir, "routes") ?? []) as { name: string }[];
    const wanted = values["extraRoutes"] as { name: string }[];
    const ok = wanted.every((entry) => routes.some((route) => route.name === entry.name));
    return ok
      ? { status: "current", detail: "routes present" }
      : { status: "missing", detail: "routes missing or stale" };
  },
  generate: (ctx) => [
    overridesMerge(
      ctx.targetDir,
      "routes",
      (ctx.values["extraRoutes"] as { name: string; path: string; access: string }[]).map((entry) => ({
        name: entry.name,
        path: entry.path,
        access:
          entry.access === "admin"
            ? { kind: "roles", roles: ["admin"] }
            : entry.access === "authenticated"
              ? { kind: "authenticated" }
              : { kind: "public" },
      })),
    ),
  ],
};

export const navigationStep: StepDef = {
  id: "navigation",
  title: "Navigation",
  schema: z.object({
    extraNav: z
      .array(z.object({ key: z.string().min(1), route: z.string().min(1) }))
      .default([]),
  }),
  ui: {
    title: "Extra navigation",
    description: "Menu items pointing at registered routes. Visibility follows the route access.",
    fields: [{ name: "extraNav", label: "Extra items (JSON)", type: "text", help: '[{"key":"billing","route":"billing"}]' }],
  },
  docs: "Adds navigation items bound to registered routes. Visibility inherits the route's reachability policy. Hiding is never security: guards recheck every entry.",
  detect: (targetDir, values) => {
    const nav = (overridesSection(targetDir, "navigation") ?? []) as { key: string }[];
    const wanted = values["extraNav"] as { key: string }[];
    const ok = wanted.every((entry) => nav.some((item) => item.key === entry.key));
    return ok
      ? { status: "current", detail: "navigation present" }
      : { status: "missing", detail: "navigation missing or stale" };
  },
  generate: (ctx) => {
    const baseAccess: Record<string, Policy> = {
      home: { kind: "public" },
      signIn: { kind: "public" },
      dashboard: { kind: "authenticated" },
      profile: { kind: "authenticated" },
      settings: { kind: "permission", permission: "settings:view" },
      admin: { kind: "roles", roles: ["admin"] },
    };
    const extra = ctx.values["extraRoutes"] as
      | { name: string; access: string }[]
      | undefined;
    const items = (ctx.values["extraNav"] as { key: string; route: string }[]).map((entry) => {
      const extraRoute = extra?.find((route) => route.name === entry.route);
      const visibility =
        extraRoute?.access === "admin"
          ? ({ kind: "roles", roles: ["admin"] } as Policy)
          : extraRoute?.access === "authenticated"
            ? ({ kind: "authenticated" } as Policy)
            : extraRoute
              ? ({ kind: "public" } as Policy)
              : (baseAccess[entry.route] ?? ({ kind: "authenticated" } as Policy));
      return { key: entry.key, route: entry.route, visibility };
    });
    return [overridesMerge(ctx.targetDir, "navigation", items)];
  },
};

export const redirectsStep: StepDef = {
  id: "redirects",
  title: "Redirects",
  schema: z.object({
    postSignIn: z.string().regex(/^\//, "absolute path").default("/dashboard"),
    denyLanding: z.string().regex(/^\//, "absolute path").default("/sign-in"),
    legacyAliases: z.array(z.object({ from: z.string().regex(/^\//), to: z.string().regex(/^\//) })).default([]),
  }),
  ui: {
    title: "Redirects",
    description: "Post sign in landing, deny landing, and legacy path aliases.",
    fields: [
      { name: "postSignIn", label: "Post sign in path", type: "text" },
      { name: "denyLanding", label: "Deny landing path", type: "text" },
      { name: "legacyAliases", label: "Legacy aliases (JSON)", type: "text", help: '[{"from":"/old","to":"/new"}]' },
    ],
  },
  docs: "Defines where sign in lands, where deny lands, and which legacy paths keep working. Destinations build over route names; user supplied next parameters are allowlisted at runtime.",
  detect: (targetDir, values) => {
    const ok = fileMatches(
      targetDir,
      "shared/redirects/generated.ts",
      redirectsContent(values["postSignIn"] as string, values["denyLanding"] as string, values["legacyAliases"] as { from: string; to: string }[]),
    );
    return ok
      ? { status: "current", detail: "redirects match" }
      : { status: "missing", detail: "redirects missing or stale" };
  },
  generate: (ctx) => [
    {
      path: "shared/redirects/generated.ts",
      content: redirectsContent(
        ctx.values["postSignIn"] as string,
        ctx.values["denyLanding"] as string,
        ctx.values["legacyAliases"] as { from: string; to: string }[],
      ),
      owned: "generated",
    },
  ],
};

function redirectsContent(postSignIn: string, denyLanding: string, aliases: { from: string; to: string }[]): string {
  return `// GENERATED by setup (redirects). Do not hand edit.
export const POST_SIGN_IN_PATH = ${JSON.stringify(postSignIn)};
export const DENY_LANDING_PATH = ${JSON.stringify(denyLanding)};
export const LEGACY_ALIASES = ${JSON.stringify(aliases)} as const;
`;
}

export const statusesStep: StepDef = {
  id: "application-statuses",
  title: "Application statuses",
  schema: z.object({
    lifecycles: z
      .array(z.object({ name: z.string().min(1), values: z.array(z.string().min(1)).min(2) }))
      .min(1)
      .default([{ name: "default", values: ["draft", "active", "archived"] }]),
  }),
  ui: {
    title: "Status lifecycles",
    description: "Named ordered value sets features reuse for status fields.",
    fields: [{ name: "lifecycles", label: "Lifecycles (JSON)", type: "text", help: '[{"name":"default","values":["draft","active","archived"]}]' }],
  },
  docs: "Declares reusable status lifecycles. Compiles to a typed constants file plus a permission doc section. Transitions themselves stay feature owned; this step only names the vocabularies.",
  detect: (targetDir, values) => {
    const lifecycles = values["lifecycles"] as { name: string; values: string[] }[];
    const section = readJsonFile(targetDir, "shared/permissions/overrides.json") as {
      statuses?: { name: string }[];
    } | null;
    const file = fileMatches(targetDir, "shared/states/generated-statuses.ts", statusesContent(lifecycles));
    const ok =
      file && lifecycles.every((entry) => section?.statuses?.some((item) => item.name === entry.name));
    return ok
      ? { status: "current", detail: "statuses present" }
      : { status: "missing", detail: "statuses missing or stale" };
  },
  generate: (ctx) => {
    const lifecycles = ctx.values["lifecycles"] as { name: string; values: string[] }[];
    return [
      overridesMerge(ctx.targetDir, "statuses", lifecycles),
      {
        path: "shared/states/generated-statuses.ts",
        content: statusesContent(lifecycles),
        owned: "generated",
      },
    ];
  },
};

function statusesContent(lifecycles: { name: string; values: string[] }[]): string {
  const entries = lifecycles
    .map((entry) => `  ${JSON.stringify(entry.name)}: ${JSON.stringify(entry.values)} as const,`)
    .join("\n");
  return `// GENERATED by setup (application-statuses). Do not hand edit.
export const STATUS_LIFECYCLES = {
${entries}
} as const;
export type StatusLifecycleName = keyof typeof STATUS_LIFECYCLES;
`;
}
