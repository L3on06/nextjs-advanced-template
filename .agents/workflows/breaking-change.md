# Workflow: breaking change

## Trigger

A change that breaks a public shape: props, schemas, callable IO, guard
verdicts, registry names, rules widening, env shape.

## Skills to load

The owning subsystem skill plus `architecture` plus `testing` plus every skill
owning an affected consumer.

## Steps

1. Name the break precisely: old shape, new shape, affected call sites and
   clients (including old mobile or deployed clients for callables).
2. Write the migration note first: version, upgrade steps, rollback, grace
   period if old clients persist.
3. Version the boundary where old callers may live on (callable name, route
   alias via `redirects`, schema version key).
4. Migrate every in repo caller in the same change. Never land the break and
   the migration separately.
5. Full suite plus E2E plus the versioned boundary test (old shape still served
   or correctly rejected).

## Gates

- Migration note exists before code review.
- Zero in repo callers on the old shape, or the old shape still served and
   tested.
- Major version bump recorded.
