---
name: firebase-functions
description: "Own Cloud Functions code: triggers, callables, and scheduled jobs under functions/. Server side business operations live here."
---

## 1. Purpose

Hold privileged operations that clients must not perform directly: writes the
rules forbid, cross document transactions, third party calls, scheduled work.

## 2. Scope

`functions/**` (sources, tests, config). Function to Firestore and Storage access
via Admin SDK.

## 3. When to use

Adding or changing a trigger, callable, or scheduled job; moving a privileged
write out of the client; integrating a vendor from the server side.

## 4. When not to use

Client SDK init (use `firebase`). Rules (use `firebase-security`). Pure client
logic that needs no privilege (keep it in the feature).

## 5. Required files

The function being changed, its test, the calling feature's contract, and the
`firebase-change` workflow. The permission model for the roles it enforces.

## 6. Architecture

One folder per function area with `index.ts` entry, Zod validated inputs on
callables, idempotency keys on money or side effect operations, structured JSON
logs with request ids. Functions recheck auth and roles; they never trust the
client's claim.

## 7. Public API

Callable names plus input and output schemas; trigger sources plus event shapes.
Clients call the typed wrapper, never raw endpoints.

## 8. Allowed dependencies

`firebase-admin`, `firebase-functions`, `zod`. Vendor SDKs only for the
integration the function performs.

## 9. Forbidden patterns

Unauthenticated callables that touch user data. Non idempotent money paths.
Business logic duplicated between client and function. Secrets outside secret
manager or env.

## 10. Security requirements

Verify auth context on every invocation. Validate and authorize inputs server
side even when the client already did. Rate limit public callables. Never log
PII or secrets.

## 11. Testing requirements

Unit test handler logic with mocked admin SDK; emulator test triggers end to
end; idempotency test repeats the call and asserts one effect. Deploy previews
only after green tests.

## 12. Update/versioning requirements

Input or output schema changes are major with a migration note and a versioned
callable name when old clients still exist. Internal logic fixes are minor.

## 13. Related blueprint

`docs/blueprints/firebase-functions.md`

## 14. Examples

```ts
// functions/orders/place.ts — validate, authorize, then act, idempotently
export const placeOrder = onCall({ region: REGION }, async (req) => {
  const input = PlaceOrderSchema.parse(req.data); // fail fast at the edge
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  return placeOrderOnce({ uid: req.auth.uid, ...input });
});
```
