# 0002. UI foundation

**Date**: 2026-09-20
**Status**: In Progress

## Summary

This spec defines a small set of UI wrappers (ready made screen pieces your apps compose) above your shadcn primitives (the copy in components you own), plus one status chain that turns platform rules into screens. It keeps feature code off shadcn internals so the look can evolve in one place. It ships eleven wrappers, one state view, and one pure resolver (a small function with no side effects that picks a status).

## Requirements

**User stories**:
- As an app builder, I want ready wrappers so that screens look alike with no extra work.
- As an app builder, I want one state view so that loading plus error plus empty look alike everywhere.
- As an app builder, I want platform statuses resolved by rules so that maintenance plus offline plus expired sessions show the right screen on every app.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: Feature code imports `App` wrappers only; no file outside `shared/` imports shadcn primitives directly (proven by an import lint rule plus a test).
- **AC-2**: `AppForm` validates controlled inputs (values held in the page, not the library) with a Zod schema (a shape checker) and shows one error per bad field.
- **AC-3**: `AppTable` renders typed columns (column shapes known at build time) and an empty state when rows are absent.
- **AC-4**: `AppPage` composes title plus actions plus content plus a state slot and fetches no data itself.
- **AC-5**: `AppState` renders loading plus error plus warning plus empty plus success plus info from variant plus title plus message plus an optional action.
- **AC-6**: The resolver maps the nine platform statuses from global plus path plus role plus permission plus feature rules in that priority order, first match in config order wins inside one priority, and no match returns null with no view plus a dev only warning.
- **AC-7**: A resolved status renders through `AppState` end to end (rule in, screen out, proven by a chain test), and the empty status renders the empty view.
- **AC-8**: Every status title and message comes from translation keys in English plus Albanian, never hardcoded copy.
- **AC-9**: No per status view components exist outside `AppState`.

## Decision

**Chosen option**: Thin wrappers plus one state view plus one pure resolver.

Feature code touches `App` names only. Shadcn stays an implementation detail inside `shared/`. Forms stay controlled with Zod and no new package. The table stays presentational in this slice. The resolver stays pure and reads route plus roles plus flags.

**Implementation skills**: `i18next-localization` (`i18next/i18next-cli`, `.agents/skills/i18next-localization/`)

## Feature design

**Data model sketch**:
No stored data in this feature (not applicable). The configurable data is the status rule list: rule with scope (global, path, role, permission, feature), match values, target status, and position in config order. Rules live in code config, not in a database.

**State transitions** (if applicable):
No entity state machine (not applicable). Resolution order is fixed: global, then path, then role, then permission, then feature. First match in config order wins inside one priority. No match yields null (no view) plus a dev only warning. The empty status is a real status that renders the empty view.

**Status inventory** (the nine ids, their copy keys, and their views):
| Status id | Title key | Message key | View |
|---|---|---|---|
| `maintenance` | `status.maintenance.title` | `status.maintenance.message` | warning |
| `offline` | `status.offline.title` | `status.offline.message` | warning |
| `no-results` | `status.no-results.title` | `status.no-results.message` | empty |
| `empty` | `status.empty.title` | `status.empty.message` | empty |
| `session-expired` | `status.session-expired.title` | `status.session-expired.message` | info |
| `verification-required` | `status.verification-required.title` | `status.verification-required.message` | info |
| `account-disabled` | `status.account-disabled.title` | `status.account-disabled.message` | error |
| `setup-required` | `status.setup-required.title` | `status.setup-required.message` | info |
| `feature-disabled` | `status.feature-disabled.title` | `status.feature-disabled.message` | empty |

**Resolver contract**:
`StatusContext` holds path plus roles plus permissions plus flags plus session plus online state. `Rule` holds scope plus match values plus target status. Path rules strip the locale prefix (`/en`, `/al`) first, then match exact or prefix as the rule declares. The algorithm walks priorities in order and returns the first rule whose match holds inside the first priority with any hit. Session expiry and offline arrive as inputs (session empty, online false), so the function stays pure with no network and no clock reads.

**Shared shapes**:
`StateAction` holds a label key plus either a link or a handler, never both empty. Each view ships a default icon and tone (loading spinner, error red, warning amber, empty gray, success green, info blue). `AppPage` takes a title key plus action nodes plus content plus an optional state node; when the state node is present it replaces the content. `Column` holds a key plus a header key plus an optional cell renderer plus an optional width plus a reserved optional sortable flag for the later sorting slice. Tables take a row key name and render loading apart from empty (loading shows skeleton rows, empty shows the empty view). Forms take values plus an on change plus an on submit plus a Zod schema, validate on submit, and show the first Zod issue per field; no async validation in this slice.

**Wrapper added props** (all else passes straight through to shadcn):
`AppInput` plus `AppSelect` take an optional field error rendered under the control. Select options pair a value with a label key. `AppDialog` is controlled only (open flag plus change handler, no internal state). `AppIcon` takes a closed name list plus a size scale, unknown names fail the build. `AppLogo` reads brand name plus brand color from config, no props for copy.

**Import boundary** (what AC-1 enforces):
Banned outside `shared/`: `@/components/ui` plus `shared/components/ui` plus any `@/components/i18n` bypass (copy flows through `T` only). Sole entry for features: the `App` names plus `T` plus route helpers. The probe test imports a shadcn button path from a fake feature file and expects the lint rule to fail it.

**API surface**:
| Element | Shape | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `AppButton` | wrapper | same props as shadcn button | button | none | none |
| `AppInput` | wrapper | same props as shadcn input plus field error | input | none | none |
| `AppSelect` | wrapper | options list plus value plus field error | select | none | none |
| `AppDialog` | wrapper | open flag plus title plus content plus actions | dialog | none | none |
| `AppCard` | wrapper | title plus content plus optional action | card | none | none |
| `AppTable` | presentational | typed columns plus rows | table plus empty state | none | none |
| `AppForm` | controlled | Zod schema plus values plus submit handler | values or field errors | none | invalid shape |
| `AppPage` | shell | title plus actions plus content plus state slot | page | none | none |
| `AppIcon` | wrapper | icon name plus size | icon | none | unknown name |
| `AppLogo` | brand | brand name plus brand color | logo | none | none |
| `AppState` | state view | variant plus title plus message plus optional action | state screen | none | none |
| `resolveStatus` | pure function | route plus roles plus flags | one of nine statuses or none | none | none |

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):
| Action | Value produced / displayed | Source |
|---|---|---|
| Resolve status | winning status | rule list in config plus route input plus session roles plus flag map |
| Resolve status | no match fallback | decided in this spec: empty |
| Render state | title plus message | translation keys per status, both locales |
| Render state | action target | caller provided handler or route name |
| Render form | field errors | Zod schema parse of caller provided values |
| Render table | empty state copy | translation keys |

**Key invariants**:
- Feature code imports `App` names only, enforced by an import lint rule.
- `AppState` is the only status view; no per status components.
- The resolver is pure: same inputs give the same status, with session plus online state passed in.
- Priority order is global, path, role, permission, feature; ties break by config order inside one priority.
- No match returns null; the empty status renders the empty view.
- All user copy flows through translation keys.

**Security model**:
Status payloads carry no personal data. The error variant shows a generic message plus an optional retry action, never internals. `AppState` renders text only, no raw HTML. Route protection stays with the authorization guards; hiding navigation is never protection.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: resolver maps a maintenance flag to the maintenance status rendered through `AppState` with translated copy, verifies **AC-6**, **AC-7**, **AC-8**
- Failure case: no rule matches and nothing renders plus a dev only warning fires, verifies **AC-6**
- Auth/permission: an expired session resolves to session expired for a signed out visitor while a plain page keeps its own content, verifies **AC-6**
- Contract: a probe file outside `shared/` importing a shadcn primitive fails the lint rule, verifies **AC-1**

## Build plan

Ordered as thin end to end slices first (the project default assumption, since no approach is recorded): the status spine before the wrappers, each slice independently checkable.

1. Build `AppState` with six variants plus tests, satisfies **AC-5**
2. Build the pure resolver with rule fixtures plus priority and tie tests, satisfies **AC-6**
3. Wire the chain resolver to `AppState` plus a chain test, satisfies **AC-7**
4. Build wrappers batch one (`AppButton`, `AppInput`, `AppSelect`, `AppDialog`, `AppCard`) plus the import lint rule, satisfies **AC-1**
5. Build `AppForm` with Zod plus per field errors plus tests, satisfies **AC-2**
6. Build `AppTable` with typed columns plus empty state plus tests, satisfies **AC-3**
7. Build `AppIcon`, `AppLogo`, `AppPage` plus composition tests, satisfies **AC-1**, **AC-4**
8. Add translation keys in both locales plus a copy parity test, satisfies **AC-8**
9. Add the no per status components check plus usage docs, satisfies **AC-9**

## Consequences

**Positive**:
- One place evolves the look for every app.
- Statuses behave alike with rule driven screens.
- No new packages in this slice.

**Negative / tradeoffs**:
- Controlled forms write more wiring than a form library until a later slice adopts one.
- The simple table will need a sorting and paging follow up once real lists land.
- Wrappers add one indirection layer over shadcn for every screen.

**Neutral**:
- Translation files grow by one key set per status.

## Follow-up

- [ ] Enroll a scope row for this feature and link this spec on accept.
- [ ] Revisit a form library when controlled wiring strains real screens.
- [ ] Plan table sorting plus paging when the first real list ships.

## Rationale

Reasoning and options: see `rationale.md`.
