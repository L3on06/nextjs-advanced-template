import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  AUTHZ_CONFIG,
  type FirestoreResource,
  type Policy,
  type StorageResource,
} from "./config";

/**
 * Deterministic compilers: config in, rules text out. No timestamps, no
 * random ids, config array order preserved, so the same config always
 * produces byte identical output. Tests assert this property.
 */

function literal(value: string | readonly string[]): string {
  return Array.isArray(value) ? `[${value.map((entry) => `'${entry}'`).join(", ")}]` : `'${value}'`;
}

function paramRef(value: string | readonly string[]): string {
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    return value.slice(1, -1);
  }
  return literal(value);
}

/** Compile a policy to a Firestore CEL expression. */
export function compileFirestorePolicy(policy: Policy, database = "$(database)"): string {
  switch (policy.kind) {
    case "public":
      return "true";
    case "authenticated":
      return "request.auth != null";
    case "deny":
      return "false";
    case "owner":
      return `request.auth != null && request.auth.uid == ${policy.param}`;
    case "roles":
      return `request.auth != null && (${policy.roles.map((role) => `hasRole('${role}')`).join(" || ")})`;
    case "permission": {
      const granted = AUTHZ_CONFIG.grants[policy.permission] ?? [];
      return `request.auth != null && (${granted.map((role) => `hasRole('${role}')`).join(" || ")})`;
    }
    case "emailMatch":
      return `request.auth != null && request.auth.token.email == resource.data.${policy.field}`;
    case "unchanged":
      return policy.fields.map((field) => `request.resource.data.${field} == resource.data.${field}`).join(" && ");
    case "createShape": {
      const fixed = Object.entries(policy.fixedValues).map(
        ([field, expected]) => `request.resource.data.${field} == ${paramRef(expected)}`,
      );
      return [`request.resource.data.keys().hasAll(${JSON.stringify(policy.requiredKeys)})`, ...fixed].join(" && ");
    }
    case "statusTransition": {
      const frozen = policy.frozenFields.map(
        (field) => `request.resource.data.${field} == resource.data.${field}`,
      );
      return [
        `resource.data.${policy.field} == '${policy.from}'`,
        `request.resource.data.${policy.field} == '${policy.to}'`,
        ...frozen,
      ].join(" && ");
    }
    case "all":
      return policy.policies.map((child) => `(${compileFirestorePolicy(child, database)})`).join(" && ");
    case "any":
      return policy.policies.map((child) => `(${compileFirestorePolicy(child, database)})`).join(" || ");
  }
}

function usesRoleLookup(resource: FirestoreResource): boolean {
  const walk = (policy: Policy): boolean => {
    if (policy.kind === "roles" || policy.kind === "permission") return true;
    if (policy.kind === "all" || policy.kind === "any") return policy.policies.some(walk);
    return false;
  };
  return Object.values(resource.policies).some(walk);
}

const FIRESTORE_HELPERS = `    function isSignedIn() {
      return request.auth != null;
    }

    function callerRoles() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('roles', [])
        : [];
    }

    function hasRole(role) {
      return role in callerRoles();
    }
`;

function compileFirestoreResource(resource: FirestoreResource): string {
  const ops = (["get", "list", "create", "update", "delete"] as const)
    .map((op) => `      allow ${op}: if ${compileFirestorePolicy(resource.policies[op])};`)
    .join("\n");
  return `    match /${resource.path} {
${ops}
    }`;
}

export function buildFirestoreRules(): string {
  const helpers = FIRESTORE_RESOURCES_USE_LOOKUP ? FIRESTORE_HELPERS : "";
  const blocks = AUTHZ_CONFIG.firestore.map(compileFirestoreResource).join("\n\n");
  return `// GENERATED — do not hand edit. Source: shared/permissions/config.ts.
// Regenerate with: npm run permissions:build
// Layering: these rules protect DIRECT CLIENT access only. The Admin SDK
// bypasses them, so server code must authorize every use (see
// shared/firebase/admin.ts). Guards recheck independently.
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
${helpers}
${blocks}

    // Deny everything else by default. New collections fail closed until a
    // reviewed resource policy is added to the config.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;
}

const FIRESTORE_RESOURCES_USE_LOOKUP = AUTHZ_CONFIG.firestore.some(usesRoleLookup);

/** Compile a policy to a Storage CEL expression. */
export function compileStoragePolicy(policy: Policy): string {
  switch (policy.kind) {
    case "public":
      return "true";
    case "authenticated":
      return "request.auth != null";
    case "deny":
      return "false";
    case "owner":
      return `request.auth != null && request.auth.uid == ${policy.param}`;
    default:
      throw new Error(
        `[permissions] Policy kind '${policy.kind}' has no Storage compiler. ` +
          `Storage resources support public, authenticated, owner, and deny only.`,
      );
  }
}

function compileStorageResource(resource: StorageResource): string {
  return `    match /${resource.path} {
      allow read: if ${compileStoragePolicy(resource.read)};
      allow write: if ${compileStoragePolicy(resource.write)}
        && request.resource.size < ${resource.maxSizeBytes};
    }`;
}

export function buildStorageRules(): string {
  const blocks = AUTHZ_CONFIG.storage.map(compileStorageResource).join("\n\n");
  return `// GENERATED — do not hand edit. Source: shared/permissions/config.ts.
// Regenerate with: npm run permissions:build
// Layering: these rules protect DIRECT CLIENT access only. The Admin SDK
// bypasses them, so server code must authorize every use (see
// shared/firebase/admin.ts).
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
${blocks}

    // Deny everything else by default.
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
`;
}

// ---------------------------------------------------------------------------
// Permission documentation
// ---------------------------------------------------------------------------

function describePolicy(policy: Policy): string {
  switch (policy.kind) {
    case "public":
      return "public";
    case "authenticated":
      return "signed in";
    case "deny":
      return "deny";
    case "owner":
      return `owner (\`${policy.param}\`)`;
    case "roles":
      return `roles: ${policy.roles.join(", ")}`;
    case "permission":
      return `permission \`${policy.permission}\``;
    case "unchanged":
      return `unchanged: ${policy.fields.join(", ")}`;
    case "emailMatch":
      return `invitee email match`;
    case "createShape":
      return `shape ${JSON.stringify(policy.requiredKeys)} + fixed ${JSON.stringify(policy.fixedValues)}`;
    case "statusTransition":
      return `status ${policy.from} → ${policy.to}, frozen ${policy.frozenFields.join(", ")}`;
    case "all":
      return policy.policies.map(describePolicy).join(" AND ");
    case "any":
      return policy.policies.map(describePolicy).join(" OR ");
  }
}

export function buildPermissionsDoc(): string {
  const grantRows = AUTHZ_CONFIG.permissions
    .map((permission) => `| \`${permission}\` | ${(AUTHZ_CONFIG.grants[permission] ?? []).join(", ")} |`)
    .join("\n");
  const routeRows = AUTHZ_CONFIG.routes
    .map((route) => `| \`${route.name}\` | \`${route.path}\` | ${describePolicy(route.access)} |`)
    .join("\n");
  const navRows = AUTHZ_CONFIG.navigation
    .map((item) => `| \`${item.key}\` | \`${item.route}\` | ${describePolicy(item.visibility)} |`)
    .join("\n");
  const featureRows = AUTHZ_CONFIG.features
    .map((feature) => `| \`${feature.name}\` | ${describePolicy(feature.access)} |`)
    .join("\n");
  const firestoreRows = AUTHZ_CONFIG.firestore
    .map(
      (resource) =>
        `### \`${resource.collection}\` (\`${resource.path}\`)\n\n` +
        `| op | policy |\n|---|---|\n` +
        (["get", "list", "create", "update", "delete"] as const)
          .map((op) => `| ${op} | ${describePolicy(resource.policies[op])} |`)
          .join("\n"),
    )
    .join("\n\n");
  const storageRows = AUTHZ_CONFIG.storage
    .map(
      (resource) =>
        `| \`${resource.name}\` (\`${resource.path}\`) | ${describePolicy(resource.read)} | ${describePolicy(resource.write)} | ${resource.maxSizeBytes} |`,
    )
    .join("\n");
  return `<!-- GENERATED — do not hand edit. Source: shared/permissions/config.ts. -->
# Permissions

Single source of truth: \`shared/permissions/config.ts\`. Route access governs
reachability only and never implies data access; Firestore and Storage access
come from the separate resource policies below.

## Roles

${AUTHZ_CONFIG.roles.map((role) => `- \`${role}\``).join("\n")}

## Permission grants

| permission | roles |
|---|---|
${grantRows}

## Routes (reachability, not data access)

| route | path | access |
|---|---|---|
${routeRows}

## Navigation (visibility, not security)

| item | route | visibility |
|---|---|---|
${navRows}

## Features

| feature | access |
|---|---|
${featureRows}

## Firestore resources

${firestoreRows}

## Storage resources

| resource (path) | read | write | max bytes |
|---|---|---|---|
${storageRows}
`;
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

/** Write all generated outputs. Deterministic: same config, same bytes. */
export function writeGenerated(root: string = process.cwd()): void {
  writeFileSync(join(root, "firestore.rules"), buildFirestoreRules());
  writeFileSync(join(root, "storage.rules"), buildStorageRules());
  writeFileSync(join(root, "docs", "PERMISSIONS.md"), buildPermissionsDoc());
}
