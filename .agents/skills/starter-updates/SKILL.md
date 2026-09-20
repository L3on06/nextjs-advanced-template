---
name: starter-updates
description: "Own changes to the Starter Kit machinery itself: .agents content, skills-lock, blueprints, and versioned kit releases."
---

## 1. Purpose

Let the kit evolve without rotting its own guidance: every machinery change
lands versioned, documented, and non contradictory.

## 2. Scope

`.agents/**`, `skills-lock.json`, `docs/blueprints/**`, kit version notes and
release checklist.

## 3. When to use

Adding or editing a skill, rule, or workflow; changing the path map; adding a
blueprint; cutting a kit release; updating a pinned external skill.

## 4. When not to use

App or feature work (use the subsystem skills). Architecture decisions about
product shape (use `architecture`, then land the resulting skill edits here).

## 5. Required files

The machinery file being changed, `rules/path-map.md` when paths shift, the
spec or decision authorizing the change.

## 6. Architecture

Single sources only: the path map lives in `rules/path-map.md`, global rules in
`rules/`, subsystem rules in skills, contracts in `docs/blueprints/`,
procedures in `workflows/`. External workflow skills stay pinned via
`skills-lock.json` and are never hand edited.

## 7. Public API

Skill names and their paths, the path map table, workflow names. Agents address
machinery by these names only.

## 8. Allowed dependencies

None at runtime; this skill governs docs and config. Validation scripts may use
Node stdlib plus a markdown parser.

## 9. Forbidden patterns

Duplicating the path map into skills or `AGENTS.md`. Restating architecture
inside skills (point at the spec and blueprint). Hand editing pinned external
skills. Parallel contradictory rules in two files.

## 10. Security requirements

Machinery changes get a contradiction scan before merge (see the
`starter-kit-update` workflow). No secrets in examples anywhere under `.agents/`.

## 11. Testing requirements

Contradiction scan plus a link check over `.agents/` and root `AGENTS.md` on
every machinery change. Skill edits name the behavior they change so a reviewer
can verify it.

## 12. Update/versioning requirements

Path map changes are major with a migration note. Skill rule tightenings are
minor; relaxations are major. Kit releases follow `docs/VERSIONING.md` with
notes listing changed skills and migration steps.

## 13. Related blueprint

`docs/blueprints/starter-updates.md`

## 14. Examples

```
# add a subsystem skill — three touches, one source of mapping
.agents/skills/billing/SKILL.md   (new, 14 sections)
.agents/rules/path-map.md         (add its rows)
docs/blueprints/billing.md        (its contract)
```
