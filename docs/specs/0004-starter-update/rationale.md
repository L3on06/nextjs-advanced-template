# Rationale for 0004 starter update

## Context

A starter kit rots the moment updating it feels dangerous. Apps pin old copies, fixes never propagate, and each copy drifts until the kit is five projects wearing one name. The missing machinery is trust: know what changed, see it before it lands, keep local work safe, and recover when a step fails. The repo already versions nothing, fingerprints nothing, and migrates nothing; the setup wizard stamps files but never revisits them. A second pressure is scope safety: Core improvements must flow while Application code stays untouched, and secrets must never leak into the machinery that copies files around.

## Options considered

### Option 1: Manifest plus preview plus backup plus ordered migrations

One root manifest, grouped previews with confirm, backups of overwritten files only, versioned migration functions in range order, full gate validation, per conflict picks, and rollback on failure.

**Pros**:
- Every scary part (silent loss, half applied state, mystery failures) has a named answer.
- Test matrix proves each promise separately.

**Cons**:
- Real machinery to build and maintain, plus manifest upkeep on every Core change.

### Option 2: Regenerate over the top

Rerun the setup stamp onto the app on every update, keeping user files by convention.

**Pros**:
- No new system; reuses the wizard.

**Cons**:
- Cannot detect local edits, preview changes, or roll back; one failure mode ruins trust permanently.

### Option 3: Docs only upgrade guides

Hand written migration notes per release with no tooling.

**Pros**:
- Zero code and full human control per step.

**Cons**:
- Does not scale past a few releases and proves nothing; drift wins by default.

## Rationale

Option 1 fits the forces in Context. Trust is the whole feature, and only an inspectable, reversible, tested updater earns it. Option 2 risks the exact silent loss the requirements forbid. Option 3 works once and fails as releases accumulate. The accepted costs are machinery maintenance and slower large updates, both cheaper than abandoned copies.

Why not plain git: many stamped apps are not git checkouts of the kit, generated file awareness needs manifest semantics git cannot express, and per conflict picks with secret exclusions want a purpose built runner. Git remains the release transport underneath.

Gap closures from the cross check (applied in place): git ref transport with local fallback and offline fail closed; manifest to manifest diffing; sha256 with normalization and no symlinks; grouped output shapes with JSON form and exit codes; the glob to label table with the orthogonal migration flag; three way merge UX with non interactive stop and resume; UTC backups with manifest backup, log rewind, untracked safety, and pruning defaults moved into the spec; the migration home plus signature plus inclusive idempotent ranges with semver order fixed everywhere; set gate commands with timeouts and double failure escalation; the pinned Application list with migration gated reclassification; the secret audit test.

No references section here by your call: the design is internal to this repo, so the reasoning above stands on its own with project sources named inline (setup wizard, ownership model, starter updates skill).
