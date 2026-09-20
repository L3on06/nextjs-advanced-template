---
name: permissions
description: "Own the permission vocabulary: roles, ownership proofs, and the one model every guard and rule reads."
---

## 1. Purpose

Keep role names and access meanings identical across app guards, Cloud Functions,
and security rules. One vocabulary, many enforcers.

## 2. Scope

`shared/permissions/**` (role constants, permission model, ownership helpers,
role predicates shared with rules).

## 3. When to use

Adding a role, defining what a role may do, changing ownership semantics,
adding a predicate that guards or rules consume.

## 4. When not to use

Enforcing a check at a route or action (use `authorization`). Writing the rules
files (use `firebase-security`). Identity (use `authentication`).

## 5. Required files

`shared/permissions/` modules and every consumer being aligned (guards, rules
review note, function checks).

## 6. Architecture

Roles are string constants in one module. The model exposes pure predicates
(`can(role, action, resource)`, `owns(user, resource)`) with no IO. Guards,
functions, and rules each evaluate the same predicates in their own layer.

## 7. Public API

`ROLES`, `can()`, `owns()`, `hasRole()`, `PERMISSION_MATRIX`. Consumers import
constants, never redefine strings.

## 8. Allowed dependencies

`zod` for role enums. No Firebase, no UI, no business imports.

## 9. Forbidden patterns

Role strings outside this module. Predicates with side effects or data fetching.
Per feature role dialects. `admin` checks that skip the model.

## 10. Security requirements

New roles default to no access until explicitly granted. Ownership always binds
to a server verified user id, never a client claim. Matrix changes get a second
reader before merge.

## 11. Testing requirements

Matrix tests enumerate every role against every action. Predicate tests cover
owner, stranger, signed out, and admin. Rules review references the matrix.

## 12. Update/versioning requirements

Granting access is major with a migration note; revoking access is major with a
rollout note. Keep `firestore.rules` and `storage.rules` aligned in the same
change.

## 13. Related blueprint

`docs/blueprints/permissions.md`

## 14. Examples

```ts
// shared/permissions/roles.ts — the one vocabulary
export const ROLES = ["owner", "editor", "viewer", "admin"] as const;
export type Role = (typeof ROLES)[number];
export const can = (role: Role, action: Action): boolean =>
  PERMISSION_MATRIX[role].includes(action);
```
