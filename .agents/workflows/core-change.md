# Workflow: Core change

## Trigger

Any edit inside `CORE` paths (`modules/`, `shared/`, or a core contract): shared
behavior every app inherits.

## Skills to load

The owning subsystem skill plus `architecture` (contract impact) plus `testing`.
Guards or rules impact also loads `authorization` or `firebase-security`.

## Steps

1. State the contract impact: who consumes this, what breaks if the shape
   shifts. If the impact is unclear, deliberate via `/architect` first.
2. Keep it generic: prove a second consumer exists or could exist. Single app
   logic belongs in `APPLICATION`, not here.
3. Update the contract or blueprint note alongside the code, in the same change.
4. Update every in repo consumer in the same change. No orphaned call sites.
5. Run the full unit suite plus affected E2E. Version per `docs/VERSIONING.md`.

## Gates

- No business logic lands in `CORE`.
- No consumer left on the old shape.
- Contract docs updated or explicitly unchanged with a reason.
