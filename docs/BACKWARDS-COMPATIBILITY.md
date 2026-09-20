# Backwards compatibility

What each change type promises to stamped apps, and what to do when a promise
breaks. Read this before cutting a kit release.

## Promises by label

- **patch**: drop in safe. No shape changes, no action needed. Docs and fixes only.
- **minor**: additive safe. New files, generators, skills, or assets. Existing code keeps working; adopt the additions at leisure.
- **major**: attention required. A contract, config shape, or generated output shape changed. Read the release notes and the migration section before updating.
- **migration** (orthogonal flag): the release transforms stamped files. The updater runs the migration functions in semver order and logs each run. Reruns are safe: migrations are idempotent.

## Writing a compatible change

1. Prefer additive changes (new files, new optional fields) over edits.
2. Never rename or remove a contract export without a major label plus a migration.
3. Keep generated output shapes stable within major versions; when a shape must change, ship the migration that rewrites stamped copies.
4. Never widen a fingerprint, backup, or log to include secret bearing paths. The exclusion list is deny by default.

## Authoring a migration

Add `migrations/NNNN-slug.ts` exporting `{ version, from, to, describe, migrate }`.
Ranges are inclusive of `to`, exclusive of `from`. `migrate(root)` returns changed
paths, writes inside root only, and must equal its rerun. Register it in
`migrations/index.ts`. Test it with the matrix below before release.

## When a promise breaks

A breaking change without a major label plus migration is a release bug: yank the
release, cut a corrected one, and note it in the log. Apps that already updated
roll back from `.starter-backups` and rerun once fixed.

## Backup pruning

Keep the last 5 runs or 30 days, whichever keeps more. Never delete the last
good restore point. Prune only whole run folders.
