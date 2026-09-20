---
name: authorization
description: "Own access enforcement in app code: route guards, server action guards, and ownership checks. What a signed in user may do."
---

## 1. Purpose

Enforce access at every entry point so no route or mutation relies on the UI
hiding a button. Guards call the permission model; rules and functions enforce
again behind them.

## 2. Scope

`proxy.ts`, route guards and layouts that gate access, server action and route
handler guards, ownership check helpers.

## 3. When to use

Protecting a route or route group, guarding a server action or API handler,
adding an ownership check, changing redirect on deny behavior.

## 4. When not to use

Defining roles or the permission vocabulary (use `permissions`). Identity flows
(use `authentication`). Database rules (use `firebase-security`).

## 5. Required files

`proxy.ts`, the guarded route or action, `shared/permissions/` for the check
being applied, `shared/redirects/` for deny destinations.

## 6. Architecture

Defense in layers: `proxy.ts` gates coarse route access, layouts refine per
segment, each server action rechecks with the permission model. Deny redirects
through `shared/redirects/` so destinations stay consistent. Guards are pure
checks returning allow or deny, never business logic.

## 7. Public API

`requireRole()`, `requireOwner()`, `guardAction()`, `denyRedirect()`. Every
guard takes the session plus the resource proof and returns a typed verdict.

## 8. Allowed dependencies

`authentication` session helpers, `permissions` model, `redirects` destinations,
`zod` for guard inputs. No direct Firebase queries inside guards.

## 9. Forbidden patterns

Client only gating with an unguarded server path. Guards that fetch business
data. Hardcoded role strings (import from `permissions`). Silent denies with no
redirect or error shape.

## 10. Security requirements

Deny by default on new routes and actions. Recheck on the server even when the
route was already gated. Never expose which half of a credential failed; never
leak resource existence to unauthorized callers.

## 11. Testing requirements

Every guard has allow and deny tests per role plus signed out. E2E probes a
protected route as stranger, owner, and admin. New routes ship with a deny test.

## 12. Update/versioning requirements

New guard helpers are minor. Changing deny behavior or guard signatures is major
with a migration note across guarded call sites.

## 13. Related blueprint

`docs/blueprints/authorization.md`

## 14. Examples

```ts
// server action — recheck at the entry, even behind a guarded page
export async function deleteProject(id: string) {
  const verdict = await requireOwner("project", id);
  if (!verdict.ok) return denyRedirect(verdict);
  return deleteProjectTx(id);
}
```
