---
name: app-state
description: "Own client state: Zustand plus zenty store placement, colocation rules, and the verify bar for the state pair."
---

## 1. Purpose

Keep client state small, local, and predictable. Server state stays on the
server; this skill governs what lives in the browser.

## 2. Scope

`shared/states/**` (cross app stores) and `features/*/states/**` (feature
stores). Store shapes, selectors, and persistence decisions.

## 3. When to use

Adding a store, choosing local versus shared placement, adding persistence,
changing a store shape, verifying the zenty and Zustand pair.

## 4. When not to use

Server data fetching (the feature's server code). URL state (use `routes`).
Auth session (use `authentication`).

## 5. Required files

The store being changed, its consuming components, the spec's state pattern
section for the verify bar.

## 6. Architecture

Stores colocate with their feature in `states/`; only genuinely shared state
lives in `shared/states/`. Entity collections use zenty helpers; single values
use plain Zustand. Selectors keep renders narrow. No persist in the foundation
slice; persistence is an explicit later decision.

## 7. Public API

Store hooks (`useXStore(selector)`), zenty entity helpers, hydration guards for
client only boot. Components select slices, never whole stores.

## 8. Allowed dependencies

`zustand`, `zenty`. No Firebase imports in stores (fetch server side, hydrate
client side). No business logic beyond state transitions.

## 9. Forbidden patterns

Whole store subscriptions in list rows. Server state duplicated into stores.
Cross feature imports of feature stores (lift to `shared/states/` instead).
Hand rolled entity caches when a zenty helper fits.

## 10. Security requirements

Never hold tokens, secrets, or other users' data in stores. Clear stores on
sign out. Persisted stores encrypt or exclude sensitive fields.

## 11. Testing requirements

Unit test transitions and selectors. The tiny entity store test gates the
Zustand 5 plus zenty pair: it must pass before locking versions. No network in
store tests.

## 12. Update/versioning requirements

Store shape changes are minor unless persisted (persisted shape changes need a
version key and a migration). Dropping zenty for plain Zustand is minor if the
hook names stay.

## 13. Related blueprint

`docs/blueprints/app-state.md`

## 14. Examples

```ts
// features/projects/states/use-projects.ts — colocated, narrow selectors
import { createEntitiesStore } from "zenty";
export const useProjects = createEntitiesStore<Project>();
export const useProjectIds = () => useProjects((s) => s.ids);
```
