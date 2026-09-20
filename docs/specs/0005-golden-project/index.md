# 0005. Golden project

**Date**: 2026-09-20
**Status**: In Progress

## Structure

- [0005-golden-app](0005-golden-app.md): the generated reference app definition, which setup inputs it stamps and which demo surfaces it serves.
- [0005-golden-validation](0005-golden-validation.md): the per release validation pipeline, which gates run in which order and what blocks a release.

Cross child contract: the app child names the stamp inputs and surfaces; the validation child consumes exactly those inputs and surfaces and adds nothing of its own. Neither child invents kit behavior; both build on specs 0001 through 0004.

## Summary

This spec defines a Golden Project (a small generated app that proves the kit works) plus the validation that gates every Core release on it. The app stamps fresh into a temp folder on every run from set setup inputs, covering Firebase plus Auth plus data plus UI plus language with no business features. One command then walks generation through install, checks, emulators, rules, build, update, and migration, blocking the release on any failure and leaving a JSON report.

## Requirements

**User stories**:
- As a kit maintainer, I want one command proving a release so that no Core change ships unproven.
- As an app builder, I want the reference stamp to stay minimal so that it never grows domain features I must untangle.
- As a release reviewer, I want update plus migration proven across releases so that stamped apps survive upgrades.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: The wizard stamps the golden app into a temp folder from set inputs covering all kit areas with zero business features.
- **AC-2**: The stamp installs clean from its lockfile.
- **AC-3**: The golden app serves sign in (Google plus email through the emulator), one themed page, and a status wall showing all nine statuses.
- **AC-4**: One command runs generation, install, typecheck, lint, tests, emulator boot, rules tests, build, update, and migration in that order.
- **AC-5**: The run proves update plus migration by stamping at the previous release then moving to current inside the run.
- **AC-6**: All five emulators boot and the rules tests pass against them.
- **AC-7**: Any failing check blocks with nonzero exit and a report marking the release blocked.
- **AC-8**: Every run leaves a JSON report plus a console summary.
- **AC-9**: A content audit in the run confirms no business features (no domain collections, screens, or copy beyond the starter set).

## Decision

**Chosen option**: Temp stamped reference plus one ordered gate command.

Each run stamps fresh (never a committed folder, so drift is impossible), installs, and walks the full gate list including cross release update. Failures block with a kept tree for inspection; success cleans the temp folder. The previous release arrives as the latest git tag, falling back to a set fixture only when no tag exists.

## Build plan

Ordered as stamp first, surfaces second, pipeline third, report last (the project default assumption): each slice runs on its own before the next depends on it.

1. Define the golden setup inputs plus the stamp step into temp folders, satisfies **AC-1**
2. Serve sign in plus the themed page plus the status wall with no business content, satisfies **AC-3**, **AC-9**
3. Prove clean install from the lockfile, satisfies **AC-2**
4. Build the ordered gate command through build with blocking failures, satisfies **AC-4**, **AC-7**
5. Add emulator boot for all five plus rules tests inside the run, satisfies **AC-6**
6. Add the cross release update plus migration proof, satisfies **AC-5**
7. Emit the JSON report plus console summary plus the content audit, satisfies **AC-8**, **AC-9**

## Consequences

**Positive**:
- Every Core release proves itself the same way.
- Temp stamping removes an entire class of drift.
- Update plus migration get proven, not promised.

**Negative / tradeoffs**:
- Full runs cost minutes of emulator plus install time on every release.
- Cross release proof needs a previous tag or fixture kept valid.
- The gate runner is more kit machinery to maintain.

**Neutral**:
- Temp folders clean on success and stay on failure for inspection.

## Follow-up

- [ ] Enroll a scope row for this feature and link this spec on accept.
- [ ] Settle the previous release fixture source (latest tag first, set fixture fallback).
- [ ] Wire the gate into release automation once it passes by hand.

## Rationale

Reasoning and options: see `rationale.md`.
