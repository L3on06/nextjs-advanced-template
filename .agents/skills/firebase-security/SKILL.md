---
name: firebase-security
description: "Own Firebase security posture: firestore.rules, storage.rules, firebase.json, and the review bar for every rules change."
---

## 1. Purpose

Make the database and storage deny by default so a missing rule is a blocked
request, never a leak. Rules are `EXTERNAL` contracts with the vendor.

## 2. Scope

`firestore.rules`, `storage.rules`, `firebase.json`, rules tests, rules review
notes.

## 3. When to use

Any change to access rules, indexes referenced by rules, Storage paths, or the
`firebase.json` emulator and deploy configuration.

## 4. When not to use

Client SDK init (use `firebase`). Data modeling or queries (the feature's skill
plus `authorization` for the app side checks).

## 5. Required files

The rules file being changed, its test file, `shared/permissions/` model for the
roles it references, and the `firebase-change` workflow.

## 6. Architecture

Rules mirror the permission model: every `allow` names a role or ownership proof
defined in `shared/permissions/`. Default deny on every collection and bucket.
Rules validate shape (types, required fields, ownership field) independent of
client validation.

## 7. Public API

The rules files themselves plus named role predicates. App code never parses
rules; it calls the permission model, rules enforce the same model server side.

## 8. Allowed dependencies

None at runtime; rules are standalone. Tests use the Firebase emulator suite.

## 9. Forbidden patterns

`allow read, write: if true`. Role strings hardcoded in rules that differ from
`shared/permissions/`. Client side only checks with no rule behind them.
Time of check to time of use gaps (validate ownership on the document, not the
request alone).

## 10. Security requirements

Every rules change needs a deny by default review plus tests for allow and deny
cases per role. Production deploy only after emulator tests pass. Log and review
any rule that grants broad reads.

## 11. Testing requirements

Rules tests cover each collection and bucket: owner allowed, stranger denied,
signed out denied, admin allowed where applicable. Run against emulators in CI.

## 12. Update/versioning requirements

Rules tightening is minor; rules widening is major and needs a migration note
plus explicit sign off. Version the review note with the deploy.

## 13. Related blueprint

`docs/blueprints/firebase-security.md`

## 14. Examples

```
// firestore.rules — ownership proof on the document, roles from one vocabulary
match /orders/{orderId} {
  allow read: if request.auth != null
    && (resource.data.ownerId == request.auth.uid || hasRole("admin"));
  allow write: if false; // writes go through Cloud Functions
}
```
