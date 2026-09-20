# Rationale for 0005 golden project

## Context

Kit quality is currently asserted by separate suites that never run as one story: unit tests pass, rules tests pass, the wizard stamps, the updater updates, but no single run proves a fresh app survives all of it on a new release. The failure this invites is the green suite red release, where each part passes alone and the combination breaks. A second pressure is scope creep in disguise: a reference app without a minimality rule quietly grows demo features until it is a product, at which point it proves nothing reusable. Temp stamping answers the first pressure only if the inputs stay set, and the minimality audit answers the second only if it runs every time.

## Options considered

### Option 1: Temp stamped reference plus one ordered gate

Fresh temp stamp per run from set inputs, full gate order including cross release update, blocking failures, JSON report, content audit for minimality.

**Pros**:
- Drift impossible and the whole story proven per release.
- One command makes the gate routine instead of heroic.

**Cons**:
- Minutes of runtime per release and a previous release fixture to keep valid.

### Option 2: Committed reference folder plus checklist

A checked in golden app with a manual gate list run by the maintainer.

**Pros**:
- Fast runs and browsable reference code.

**Cons**:
- The folder drifts from the wizard within weeks and the checklist gets skipped under pressure.

### Option 3: Existing suites only, no reference app

Rely on unit plus rules plus wizard tests already in the repo.

**Pros**:
- Zero new machinery.

**Cons**:
- Proves parts, never the combination or the update path; the green suite red release stays possible.

## Rationale

Option 1 fits the forces in Context. The release gate must prove the combination and the update path, which only an end to end stamped run does, and temp stamping plus the audit keep it honest. Option 2 decays and Option 3 leaves the riskiest paths unproven. The accepted costs are runtime minutes and fixture upkeep, both cheaper than a broken release.

Two calls in here are mine. Previous release resolves to the latest git tag because tags already mark releases in this repo, with a set fixture only as fallback. Temp folders clean on success and stay on failure so a blocked release always leaves evidence.

Gap closures from the cross check (applied in place): the literal golden inputs file; serving pass rules per surface; the set toolchain with stamped app scripts; the named command with flags and temp pattern; tag rules with fixture freshness; the five emulator ready gate; the set report schema; the audit allow list with run position; the fast versus nightly split; the named failure coverage.

No references section here by your call: the design is internal to this repo, so the reasoning above stands on its own with project sources named inline (setup wizard, updater gates, emulator suite, status wall from spec 0002).
