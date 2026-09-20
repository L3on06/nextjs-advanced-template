---
name: setup
description: "Own the app generator: everything under setup/ that stamps new applications from this Starter Kit."
---

## 1. Purpose

Turn the foundation into repeatable new apps. `setup/` is the generator; its
output is `GENERATED` and must be reproducible from a clean checkout.

## 2. Scope

`setup/**` (engine, filesystem steps, generators, schemas, state, steps,
templates, ui). The shape check that proves the folder split on every run.

## 3. When to use

Scaffolding a new app, adding a generator or template, changing what the stamp
produces, or fixing the shape check.

## 4. When not to use

Editing a stamped app afterwards (that is `APPLICATION` work under its own
skills). Changing architecture contracts (use `architecture`).

## 5. Required files

`docs/specs/0001-starter-kit-foundation/`, `.agents/rules/ownership.md`, and the
template being changed. Read the generator schema before touching its steps.

## 6. Architecture

`setup/engine/` runs `setup/steps/` in order against `setup/state/`, validating
each step with `setup/schemas/` and writing through `setup/filesystem/`.
`setup/templates/` hold the stamped content; `setup/ui/` holds prompts. Steps are
small, ordered, idempotent (safe to rerun).

## 7. Public API

The generator CLI entry plus `setup/templates/` names plus the shape check
command. Stamped apps consume output only, never `setup/` internals.

## 8. Allowed dependencies

`zod` for schemas, Node stdlib for filesystem, the repo's own engine modules.
No app runtime dependencies inside the generator.

## 9. Forbidden patterns

Templates importing from `setup/` internals. Non idempotent steps. Hand editing
stamped output instead of fixing the template. Prompts without schema validation.

## 10. Security requirements

Generated apps must include env validation and secret hygiene from the first
stamp. Never stamp real credentials, tokens, or project IDs into templates.

## 11. Testing requirements

Every generator change stamps into a temp dir and runs the shape check plus
`tsc` on the output. The shape check itself has a unit test per rule it enforces.

## 12. Update/versioning requirements

Template changes are minor; step order or schema changes are major and need a
migration note in `docs/`. Regenerate the reference app when templates change.

## 13. Related blueprint

`docs/blueprints/setup.md`

## 14. Examples

```
# Add a template + step + schema together
setup/templates/auth-page.tsx
setup/schemas/auth-page.schema.ts
setup/steps/add-auth-page.ts
# Verify
npm run setup:shape-check
```
