# Workflow: Starter Kit update

## Trigger

A kit release: changed skills, rules, workflows, blueprints, templates, or
pinned external skills.

## Skills to load

`starter-updates` plus `architecture` for contract impact, plus any subsystem
skill whose rules changed.

## Steps

1. Collect the change list: which skills, rules, workflows, blueprints, and
   templates moved, and whether each is major or minor.
2. Run the contradiction scan: every path maps to exactly one skill, no two
   files order the same behavior differently, no skill restates architecture
   that changed elsewhere. Fix conflicts before release.
3. Write release notes: changed areas, migration steps for stamped apps, and
   the new kit version per `docs/VERSIONING.md`.
4. Regenerate the reference app from updated templates and run its full gates
   (typecheck, lint, tests, build, shape check).
5. Update `skills-lock.json` entries for any refreshed external skill. Never
   hand edit pinned external skill content.

## Gates

- Contradiction scan clean.
- Reference app regenerates and passes all gates.
- Release notes list every migration step a stamped app needs.
