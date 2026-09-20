---
name: architecture
description: "Guard the Starter Kit foundation itself: specs, contracts, versioning, and any decision that changes what the architecture is."
---

## 1. Purpose

Own the definition of the architecture so every later change has a contract to
build against. This skill governs decisions, not implementation.

## 2. Scope

`docs/specs/**`, `docs/ARCHITECTURE.md`, `docs/CORE-CONTRACT.md`,
`docs/VERSIONING.md`. Decisions that alter the folder shape, the ownership model,
or the locked stack.

## 3. When to use

Starting the scaffold, changing the folder shape or ownership areas, locking or
replacing a stack layer, or whenever a build surfaces an undecided load bearing
choice.

## 4. When not to use

Building a feature inside the existing shape (use the subsystem skill for its
paths plus the `new-feature` workflow). Fixing a bug without changing a decision.

## 5. Required files

Read before deciding: root `AGENTS.md`, `docs/specs/0001-starter-kit-foundation/`
(`index.md` plus `rationale.md`), and any existing spec the topic overlaps. The
`docs/` contract files once the scaffold creates them.

## 6. Architecture

Decisions live in `docs/specs/` as numbered specs (`NNNN-kebab-title/` with
`index.md` plus `rationale.md`); contracts live in `docs/` (`ARCHITECTURE.md`,
`CORE-CONTRACT.md`, `VERSIONING.md`). Specs deliberate, contracts declare, code
implements. Never decide in code what belongs in a spec.

## 7. Public API

Specs expose `## Decision` plus `## Proposed stack` (or `## Standard definition`)
plus `## Consequences` plus `## Follow up`. Contracts expose versioned guarantees
other skills may rely on.

## 8. Allowed dependencies

Prior specs and the repo's `AGENTS.md`. Web sources only to verify current
versions during deliberation; links are recorded once in the spec's References.

## 9. Forbidden patterns

Deciding in a chat message instead of a spec. Editing spec content from a build
(only the `**Status**:` line moves, via `/develop`). Duplicating contract text
into skills or workflows.

## 10. Security requirements

Name the compliance scope in `## Context` when a decision touches regulated data.
Audit logging is not negotiable for money, identity, or access decisions.

## 11. Testing requirements

Decision specs carry no build plan and no tests by rule; the executing feature
derives verification from the decision at build time.

## 12. Update/versioning requirements

New decision → new spec (`Proposed`). Evolving decision → edit in place.
Replaced decision → new spec plus `Superseded by` on the old one. Contract edits
follow `docs/VERSIONING.md` once it exists.

## 13. Related blueprint

`docs/blueprints/architecture.md`

## 14. Examples

```
# New stack layer decision → deliberate, then record
/docs/specs/0002-adopt-object-storage/  (index.md + rationale.md)
# Contract edit → version it
/docs/ARCHITECTURE.md  (minor: new subsystem section, no breaking change)
```
