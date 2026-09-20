# 0004. Starter update system

**Date**: 2026-09-20
**Status**: In Progress

## Summary

This spec defines how the kit updates itself safely: one root manifest (a single file holding versions plus fingerprints plus history) tracks what is installed, the updater previews changes, backs up only what it will overwrite, migrates in order, and validates with the full gates. Locally modified Core files always ask per conflict and Application files are never touched. It ships three commands plus a migration runner plus a compatibility guide.

## Requirements

**User stories**:
- As a kit maintainer, I want versioned updates with previews so that adopting a new kit never surprises an app.
- As an app builder, I want my local Core edits respected so that no update silently eats my work.
- As an app builder, I want failed updates to roll back so that I always land on a working tree.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: `starter:check` reports the installed version plus pending changes grouped by type and writes nothing.
- **AC-2**: `starter:update` detects locally modified Core files and asks keep mine, take theirs, or merge by hand per conflict, never deciding silently.
- **AC-3**: Backups hold overwritten files only under `.starter-backups` with no secrets, and rollback restores the tree byte identical.
- **AC-4**: Migrations run in version order, log each run, and a failed update rolls back then reports what broke.
- **AC-5**: Validation runs typecheck plus lint plus tests plus build in that order after apply and after rollback.
- **AC-6**: Every change carries patch, minor, major, or migration labels decided by path rules.
- **AC-7**: Application owned files are never written by the updater, proven by a test that dirties one and updates.
- **AC-8**: The test matrix passes: clean update, modified Core file, generated config change, migration, conflict, failed update, rollback recovery.
- **AC-9**: A backwards compatibility guide exists under `docs/` describing what each change type promises.

## Decision

**Chosen option**: Manifest plus preview plus backup plus ordered migrations.

One `starter.json` at root holds the kit version plus the schema version plus Core plus generated fingerprints plus the migration log. The updater inspects, previews grouped changes with a confirm prompt, backs up overwritten files only, applies safe changes, runs versioned TypeScript migration functions in range order, then validates. Conflicts resolve per file by explicit pick.

## Feature design

**Data model sketch**:
No database rows (not applicable). The configured data is `starter.json`: kit version, schema version, fingerprints map of path to hash covering Core paths plus generated outputs, the pinned Application path list, and the migration log of applied versions in semver order. Backups are timestamped folders of overwritten files only. Ordering is semver version order everywhere; timestamps are human readable record only. (This corrects an early draft that mixed timestamp ordering in.)

**State transitions** (if applicable):
Update run states: inspect, preview, backup, apply, migrate, validate, done. Failure at migrate or validate moves to rollback then to reported failure. Rollback restores backup files, rewinds the migration log to pre run, and reruns validation. Dry run executes inspect plus preview only and writes nothing. A crashed prompt leaves the backup plus its manifest, and rerunning resumes from it.

**Release source plus diff base**:
Releases arrive as git refs with a local directory fallback for offline testing; offline with no local release fails closed with a clear message, and public refs need no auth. The diff compares installed manifest fingerprints against the release manifest fingerprints; the version list comes from the release. Fingerprints use sha256 over line ending normalized bytes; symlinks are never followed and read errors fail closed.

**Output shape**:
Grouped fields per change are path, label, and conflict state, sorted by path. Human output prints groups with counts; `--json` prints the same shape for tooling. Exit codes are 0 for done or clean check, 1 for errors, 2 for stopped on unresolved conflicts.

**State transitions** (if applicable):
Update run states: inspect, preview, backup, apply, migrate, validate, done. Failure at migrate or validate moves to rollback then to reported failure. Rollback restores backup files and reruns validation. Dry run executes inspect plus preview only and writes nothing.

**API surface**:
| Element | Shape | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `starter:check` | read only command | manifest plus working tree | grouped pending changes | none | unreadable manifest |
| `starter:update` | interactive command | confirm plus per conflict picks | applied files plus backup plus log | none | conflict without pick, failed gate |
| `starter:update --dry-run` | preview command | same as update | grouped list, zero writes | none | none |
| Migration function | typed unit | from plus to range | transformed files | none | failed migration triggers rollback |
| Manifest | JSON file | kit release data | version plus hashes plus log | none | schema mismatch fails closed |

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):
| Action | Value produced / displayed | Source |
|---|---|---|
| Inspect | modified Core list | fingerprint compare of manifest hashes against the tree |
| Preview | grouped change list | release diff plus classification rules below |
| Backup | stored copies | overwritten files only, secrets excluded by path rules |
| Apply | new file contents | kit release payload |
| Migrate | transformed files | ordered migration functions in range |
| Validate | gate results | typecheck plus lint plus tests plus build commands |
| Rollback | restored tree | backup folder contents |

**Classification rules** (path based, migration orthogonal):
| Paths | Label |
|---|---|
| `docs/` only, no shape change | patch |
| New generators, skills, rules, assets, no contract change | minor |
| Contract or config shape breaks, generated output shape stamped code depends on | major |
Any release needing edits in stamped apps also ships migration functions and carries the migration flag beside its level. The flag is orthogonal: a minor release can carry a migration, and the runner always executes in range migrations regardless of level.

**Conflict UX**:
Three way merge uses the installed manifest content as base, local tree as mine, release as theirs. Interactive runs ask per file with keep mine, take theirs, or merge by hand. Non interactive mode stops on the first conflict with exit 2 and leaves tree plus backup intact. Resume rereads the backup manifest and continues after the last applied file.

**Atomicity plus pruning**:
Backup folders use UTC timestamps and never collide by construction (a suffix counts up on clash). The manifest itself is backed up too. Untracked and ignored files are never touched. `.starter-backups/` is excluded from fingerprints. Backups keep the last 5 runs or 30 days and never delete the last good restore point.

**Migration contract**:
Migrations live in `migrations/NNN-slug.ts` with signature `migrate(tree)`, inclusive from plus to ranges, and idempotent reruns (running twice equals running once). Out of tree side effects are forbidden and tested. Disk space is checked before mutate; a full disk fails before anything writes.

**Validation plus failure reports**:
Gates run `tsc --noEmit`, then lint, then unit tests, then the emulator rules tests, then `next build`, each with a ten minute timeout. Post rollback validation failure escalates: the backup is kept, nothing is auto retried, and the report names the failing gate with logs. Failure reports carry the failed step, the gate output tail, the backup path, and resume instructions.

**Secret safety**:
Secret bearing paths stay on a fixed exclusion list (env files, service account files, key files). A path joining that list later is denied by default: an audit test scans backups plus manifests plus logs for secret patterns on every run of the matrix.

**Key invariants**:
- No silent overwrites of locally modified Core files, ever.
- Application owned files are never written, even with force flags; the manifest pins the Application list and any category change between versions ships a migration.
- Backups and manifests never hold secrets; secret paths are excluded by rule.
- Dry run writes nothing, including no state changes.
- Rollback leaves a validated tree or a clear failure report, never a half applied update.

**Security model**:
No credentials in the manifest, backups, or logs. Secret bearing paths (env files, service account files) are excluded from fingerprints, backups, and previews by path rule. Conflict diffs show file content the engineer already has locally, nothing fetched remotely.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: clean tree updates with preview plus backup plus gates green, verifies **AC-1**, **AC-5**, **AC-8**
- Failure case: a migration fails mid run and the tree restores byte identical with a failure report, verifies **AC-4**, **AC-8**
- Conflict case: a modified Core file offers keep mine, take theirs, or merge by hand with nothing applied silently, verifies **AC-2**, **AC-8**
- Boundary case: a dirtied Application file survives the update untouched, verifies **AC-7**

## Build plan

Ordered as a thin inspect plus check thread first (the project default assumption): observe before mutating, then the mutating path, then recovery, then gates and docs.

1. Write the manifest shape plus fingerprinting plus `starter:check` with grouped output, satisfies **AC-1**, **AC-6**
2. Build preview plus confirm plus backup plus apply with secret exclusions, satisfies **AC-3**
3. Add per conflict picks with no silent path, satisfies **AC-2**
4. Build the migration runner with ordered versioned functions plus logging, satisfies **AC-4**
5. Build rollback plus failure reporting, satisfies **AC-4**
6. Wire the validate gates in order after apply and after rollback, satisfies **AC-5**
7. Guard Application paths plus write the compatibility guide plus the full test matrix, satisfies **AC-7**, **AC-8**, **AC-9**

## Consequences

**Positive**:
- Updates become routine instead of scary.
- Local work is never eaten silently.
- Every failure lands on a working tree or a clear report.

**Negative / tradeoffs**:
- Fingerprint discipline taxes every Core change with manifest upkeep.
- Per conflict picks slow large updates with many local edits.
- The migration runner is one more piece of kit machinery to maintain.

**Neutral**:
- Backup folders accumulate until pruned; pruning policy ships with the guide.

## Follow-up

- [ ] Enroll a scope row for this feature and link this spec on accept.
- [ ] Revisit machine readable release diffs when releases grow complex.

## Rationale

Reasoning and options: see `rationale.md`.
