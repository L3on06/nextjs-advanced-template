# Workflow: bug fix

## Trigger

A failing behavior with a known good expectation: broken test, report, or
regression.

## Skills to load

Path map skills for the broken paths, plus `testing`. Prefer `/debug` for
localization before editing.

## Steps

1. Reproduce first: failing test or steps that show the break. No fix without a
   reproduction.
2. Localize to the smallest owning subsystem and load its skill if not loaded.
3. Fix at the owning layer only. Do not remodel neighboring subsystems to fit
   the fix.
4. Add the regression test that would have caught it, at the lowest layer that
   reproduces it.
5. Run typecheck, lint, and the surrounding suite. If the fix changes a contract
   (props, schema, guard behavior), treat it as `core-change` or
   `breaking-change` instead.

## Gates

- Reproduction plus regression test in the same change.
- No contract change smuggled inside a fix.
- No commented out code, no unrelated drive by edits.
