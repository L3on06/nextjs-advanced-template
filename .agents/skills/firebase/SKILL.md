---
name: firebase
description: "Own Firebase client and admin initialization: config, typed init, lazy SDK getters, emulator hooks. No business models."
---

## 1. Purpose

Give every app one typed Firebase entry point so SDK setup is never reinvented
per feature. Init only; data access patterns belong to the calling feature.

## 2. Scope

`shared/firebase/**` (config, client init, admin init, per product getters,
emulator helpers, env schema).

## 3. When to use

Wiring Firebase into an app, adding a product getter (Auth, Firestore, Storage),
changing init or emulator behavior, rotating env shape.

## 4. When not to use

Writing security rules (use `firebase-security`). Writing Cloud Functions (use
`firebase-functions`). Reading or writing business data (the feature's skill).

## 5. Required files

`shared/firebase/` init modules, the env schema, `docs/specs/0001-starter-kit-foundation/`
(Firebase surface section). Firebase release notes when upgrading the SDK.

## 6. Architecture

One client module initializes `firebase/app` once; product getters (`getAuth`,
`getDb`, `getStorage`) lazily resolve from it. Admin init is server only,
guarded by env presence. Emulator wiring is dev only and branch isolated.
Zod validates env at boot with fail fast.

## 7. Public API

`getFirebaseApp()`, `getFirebaseAuth()`, `getFirestoreDb()`, `getFirebaseStorage()`,
`getAdminApp()`, `connectEmulatorsInDev()`. Features import getters only, never
construct SDK instances.

## 8. Allowed dependencies

`firebase` SDK, `zod` for env schema. Nothing app specific, no UI imports.

## 9. Forbidden patterns

Top level SDK construction at import time. Client bundle importing admin SDK.
Business queries inside `shared/firebase/`. Real project IDs or keys in code;
env only.

## 10. Security requirements

Admin credentials server only, never prefixed for the client. Fail closed when
env is missing. Emulator code must never run against production data.

## 11. Testing requirements

Unit test env schema accept and reject cases. Init tests use emulators or mocks,
never production projects. SDK upgrade runs the full suite plus a smoke boot.

## 12. Update/versioning requirements

SDK upgrades are minor unless the getter signatures change (then major with a
migration note). Env shape changes are major: update schema, docs, and stamped
templates together.

## 13. Related blueprint

`docs/blueprints/firebase.md`

## 14. Examples

```ts
// features/checkout/actions.ts — feature code uses the getter, owns the query
import { getFirestoreDb } from "@/shared/firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

const snap = await getDoc(doc(getFirestoreDb(), "prices", priceId));
```
