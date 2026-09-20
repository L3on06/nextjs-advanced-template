---
name: testing
description: "Own the testing contract: what gets tested, where tests live, and the gates every change passes."
---

## 1. Purpose

Keep the suite fast, colocated, and honest so agents write the test with the
code instead of after it, or never.

## 2. Scope

`e2e/**`, `**/*.test.*`, `**/*.spec.*`, `vitest.config.*`,
`playwright.config.*`, `shared/test-setup.ts`, coverage gates.

## 3. When to use

Adding unit, integration, rules, or E2E tests; changing test config; defining
what a change type must verify; debugging a failing suite.

## 4. When not to use

Subsystem behavior itself (the owning skill defines it; this skill defines how
it is proven). Production code edits.

## 5. Required files

`test-preferences.json`, the code under test, the workflow for the change type
being verified.

## 6. Architecture

Pyramid with teeth: unit tests colocate with sources, rules tests guard
`*.rules` files against emulators, E2E covers critical user paths in both
locales. Config is shared; fixtures live beside their suites.

## 7. Public API

Test scripts (`test`, `test:e2e`), shared setup module, fixture builders. Every
suite names the requirement or AC it verifies.

## 8. Allowed dependencies

`vitest`, `playwright`, testing-library packages, emulator suites. Never
production vendor projects; emulators or mocks only.

## 9. Forbidden patterns

Tests without assertions on behavior. E2E depending on test order. Mocks that
mirror the implementation instead of the contract. Skipped tests without a
tracking follow up.

## 10. Security requirements

Test accounts and emulator seeds only; no production credentials anywhere in
fixtures. Scrub snapshots of tokens and PII.

## 11. Testing requirements

Meta by nature: the suite itself is the subject. New test layers need a
representative test plus a CI gate entry. Flaky tests quarantine fast.

## 12. Update/versioning requirements

Gate changes (new required suites, coverage thresholds) are major with a team
note. New fixture builders are minor.

## 13. Related blueprint

`docs/blueprints/testing.md`

## 14. Examples

```
# colocated unit + emulator rules test + locale E2E
shared/permissions/matrix.test.ts
firestore.rules.test.ts        (emulator)
e2e/locale-switch.spec.ts      (en + al)
```
