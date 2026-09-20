/**
 * Single typed authorization configuration: the one source of truth.
 *
 * Route permissions NEVER imply data access. Routes compile to guards and
 * navigation visibility only. Firestore and Storage access compile from the
 * SEPARATE resource policies below into generated rules. A screen being
 * reachable says nothing about what the database will allow.
 */

export const ROLES = ["viewer", "editor", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "profile:read",
  "profile:write",
  "users:read",
  "users:manage",
  "invites:manage",
  "settings:view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/** Which roles hold each permission. Roles are additive. */
export const PERMISSION_GRANTS: Record<Permission, Role[]> = {
  "profile:read": ["viewer", "editor", "admin"],
  "profile:write": ["viewer", "editor", "admin"],
  "users:read": ["admin"],
  "users:manage": ["admin"],
  "invites:manage": ["editor", "admin"],
  "settings:view": ["editor", "admin"],
};

// ---------------------------------------------------------------------------
// Access policies (shared vocabulary for routes, nav, features, resources)
// ---------------------------------------------------------------------------

export type Policy =
  | { kind: "public" }
  | { kind: "authenticated" }
  | { kind: "deny" }
  | { kind: "owner"; param: string }
  | { kind: "roles"; roles: readonly Role[] }
  | { kind: "permission"; permission: Permission }
  | { kind: "unchanged"; fields: readonly string[] }
  | { kind: "all"; policies: readonly Policy[] }
  | { kind: "any"; policies: readonly Policy[] }
  | { kind: "emailMatch"; field: string }
  | {
      kind: "createShape";
      requiredKeys: readonly string[];
      fixedValues: Record<string, string | readonly string[]>;
    }
  | {
      kind: "statusTransition";
      field: string;
      from: string;
      to: string;
      frozenFields: readonly string[];
    };

// ---------------------------------------------------------------------------
// Routes: reachability only. Never data access.
// ---------------------------------------------------------------------------

export interface RouteDef {
  name: string;
  path: string;
  access: Policy;
}

export const ROUTES: RouteDef[] = [
  { name: "home", path: "/", access: { kind: "public" } },
  { name: "signIn", path: "/sign-in", access: { kind: "public" } },
  { name: "dashboard", path: "/dashboard", access: { kind: "authenticated" } },
  { name: "profile", path: "/profile", access: { kind: "authenticated" } },
  {
    name: "settings",
    path: "/settings",
    access: { kind: "permission", permission: "settings:view" },
  },
  { name: "admin", path: "/admin", access: { kind: "roles", roles: ["admin"] } },
];

// ---------------------------------------------------------------------------
// Navigation: visibility only. Never security (guards recheck every entry).
// ---------------------------------------------------------------------------

export interface NavItem {
  key: string;
  route: string;
  visibility: Policy;
}

export const NAVIGATION: NavItem[] = [
  { key: "home", route: "home", visibility: { kind: "public" } },
  { key: "dashboard", route: "dashboard", visibility: { kind: "authenticated" } },
  {
    key: "settings",
    route: "settings",
    visibility: { kind: "permission", permission: "settings:view" },
  },
  { key: "admin", route: "admin", visibility: { kind: "roles", roles: ["admin"] } },
];

// ---------------------------------------------------------------------------
// Feature access: named product capabilities bound to permissions or roles.
// ---------------------------------------------------------------------------

export interface FeatureDef {
  name: string;
  access: Policy;
}

export const FEATURES: FeatureDef[] = [
  { name: "userProfiles", access: { kind: "authenticated" } },
  {
    name: "userManagement",
    access: { kind: "permission", permission: "users:manage" },
  },
  {
    name: "inviteTeammates",
    access: { kind: "permission", permission: "invites:manage" },
  },
];

// ---------------------------------------------------------------------------
// Firestore resource policies. Independent of routes by design.
// ---------------------------------------------------------------------------

export type FirestoreOp = "get" | "list" | "create" | "update" | "delete";

export interface FirestoreResource {
  collection: string;
  path: string;
  pathParams: string[];
  policies: Record<FirestoreOp, Policy>;
}

export const FIRESTORE_RESOURCES: FirestoreResource[] = [
  {
    collection: "users",
    path: "users/{userId}",
    pathParams: ["userId"],
    policies: {
      get: {
        kind: "any",
        policies: [{ kind: "owner", param: "userId" }, { kind: "roles", roles: ["admin"] }],
      },
      list: { kind: "deny" },
      create: {
        kind: "all",
        policies: [
          { kind: "owner", param: "userId" },
          {
            kind: "createShape",
            requiredKeys: ["uid", "email", "displayName", "roles"],
            fixedValues: { uid: "{userId}", roles: ["viewer"] },
          },
        ],
      },
      update: {
        kind: "any",
        policies: [
          {
            kind: "all",
            policies: [{ kind: "owner", param: "userId" }, { kind: "unchanged", fields: ["roles"] }],
          },
          { kind: "roles", roles: ["admin"] },
        ],
      },
      delete: { kind: "roles", roles: ["admin"] },
    },
  },
  {
    collection: "invites",
    path: "invites/{inviteId}",
    pathParams: ["inviteId"],
    policies: {
      get: {
        kind: "any",
        policies: [
          { kind: "permission", permission: "invites:manage" },
          { kind: "emailMatch", field: "email" },
        ],
      },
      list: { kind: "permission", permission: "invites:manage" },
      create: { kind: "permission", permission: "invites:manage" },
      update: {
        kind: "any",
        policies: [
          { kind: "permission", permission: "invites:manage" },
          {
            kind: "statusTransition",
            field: "status",
            from: "pending",
            to: "accepted",
            frozenFields: ["email", "role"],
          },
        ],
      },
      delete: { kind: "permission", permission: "invites:manage" },
    },
  },
];

// ---------------------------------------------------------------------------
// Storage resource policies. Independent of routes by design.
// ---------------------------------------------------------------------------

export interface StorageResource {
  name: string;
  path: string;
  pathParams: string[];
  read: Policy;
  write: Policy;
  maxSizeBytes: number;
}

export const STORAGE_RESOURCES: StorageResource[] = [
  {
    name: "userFiles",
    path: "users/{userId}/{filePath=**}",
    pathParams: ["userId"],
    read: { kind: "owner", param: "userId" },
    write: { kind: "owner", param: "userId" },
    maxSizeBytes: 10 * 1024 * 1024,
  },
];

export interface AuthzConfig {
  roles: readonly Role[];
  permissions: readonly Permission[];
  grants: Record<Permission, Role[]>;
  routes: RouteDef[];
  navigation: NavItem[];
  features: FeatureDef[];
  firestore: FirestoreResource[];
  storage: StorageResource[];
}

export const AUTHZ_CONFIG: AuthzConfig = {
  roles: ROLES,
  permissions: PERMISSIONS,
  grants: PERMISSION_GRANTS,
  routes: ROUTES,
  navigation: NAVIGATION,
  features: FEATURES,
  firestore: FIRESTORE_RESOURCES,
  storage: STORAGE_RESOURCES,
};
