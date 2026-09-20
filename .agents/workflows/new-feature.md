# Workflow: new feature

## Trigger

A scoped feature row exists with a spec pointer, or `/architect` just wrote one.

## Skills to load

Path map skills for every touched path, plus `testing`. Guards add
`authorization`; copy adds `translations`; links add `routes`.

## Steps

1. Read the spec and the loaded skills. If a load bearing choice is undecided,
   stop and route to `/architect`.
2. List the files to create or edit, grouped by skill. Confirm no touched path
   lacks a loaded skill.
3. Build in spec order: schemas first, server logic, guards, UI, copy last.
4. Add tests with the code: unit for logic, guard tests per role, E2E for the
   user path in both locales where UI ships.
5. Run typecheck, lint, and the affected tests. Fix or explicitly defer with a
   follow up.

## Gates

- No hardcoded copy, no hardcoded routes, no client only gating.
- Every new route has a name plus a deny test if guarded.
- Scope row advanced only as `/develop` allows.
