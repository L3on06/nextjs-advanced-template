# 0005 Golden validation

## Summary

The validation pipeline is one command walking the full gate list in a set order with blocking failures and a JSON report. Short rationale: a single ordered gate makes releases routine, and cross release proof keeps updates honest.

## Requirements

Satisfies **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8** of the umbrella.

## Decision

Order is generation, install, typecheck, lint, unit tests, emulator boot of all five, rules tests, build, update from the previous release, migration, then the report. Previous release resolves to the latest git tag with a set fixture fallback. Any failure stops the run with nonzero exit, keeps the temp tree, and marks the report blocked. Success cleans the temp folder. The report holds per gate pass or fail with durations plus the update plus migration log.

**Command plus toolchain**:
The command is `npm run golden` with a `--keep` flag preserving the temp tree on success. Temp folders follow `golden-<UTC stamp>` under the system temp dir. Toolchain is set: Node 22, clean install from the lockfile, and gates run the stamped app scripts (its typecheck, lint, tests, build), never the kit scripts, so the run proves the stamp.

**Previous release rules**:
Tags match semantic versions (`v*`), annotated or lightweight both accepted. Shallow clones or missing tags fall back to the set fixture, and the report logs which source was used. The fixture carries its own freshness check: its kit version must trail current by exactly the release under test, else the run fails instead of proving the wrong baseline.

**Emulator ready gate**:
Auth plus Firestore plus Storage plus Functions plus UI boot with a health check each, a 120 second timeout, and one port retry on collision before failing. Rules tests run against these five, never production.

**Report schema**:
`golden-report.json` holds the kit version plus previous version plus stamp time plus environment plus per gate name with pass or fail plus duration plus log tail plus the update plus migration entries plus the audit verdict. Console prints one line per gate plus the final blocked or passed verdict.

**Fast versus nightly**:
The release gate runs everything. A fast gate of lint plus typecheck plus unit tests may run on every commit; only the full gate releases. Both read the same definitions so they cannot disagree on what passing means.

**Covered failures**:
Offline install, OAuth outside the emulator, missing Java for the Functions emulator, port collisions on rerun, and fixture drift each fail the run with a named reason instead of a mystery.

## Build plan

1. Build the ordered gate runner with blocking failures, satisfies **AC-4**, **AC-7**
2. Boot all five emulators with rules tests inside the run, satisfies **AC-6**
3. Add the previous release stamp plus update plus migration proof, satisfies **AC-5**
4. Emit the JSON report plus console summary, satisfies **AC-8**
