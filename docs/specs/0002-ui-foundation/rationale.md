# Rationale for 0002 UI foundation

## Context

Every new app needs the same screen pieces: buttons that match, inputs with errors, dialogs, cards, tables, pages with titles. Without a shared layer each feature reaches past the page into the underlying component kit. The look then drifts per screen and a rebrand means touching every file. A second gap sits beside it: platform conditions like maintenance, offline, expired sessions, or disabled features each need a screen, and without rules those screens get invented per app with hardcoded copy.

Your repo already holds shadcn primitives in `shared/components/ui/` on React 19 plus Tailwind 4, with English plus Albanian copy rules in `AGENTS.md`. The permission model from spec 0001 gives roles plus flags the resolver can read. What is missing is the thin layer above the primitives and the rule driven status chain. No stored data is involved; the configurable data is a rule list in code.

## Options considered

### Option 1: Thin wrappers plus one state view plus one pure resolver

Eleven `App` wrappers pass shadcn props through with starter defaults, `AppForm` stays controlled with Zod, the table stays presentational, and a pure function maps platform rules to nine statuses rendered only through `AppState`.

**Pros**:
- Smallest layer that stops drift and unifies statuses.
- No new packages and no stored state to operate.

**Cons**:
- Controlled forms and the simple table will want stronger tools as apps grow.

### Option 2: Full design system now

Wrappers plus a form library plus a full data table with sorting plus filtering plus paging, all in this slice.

**Pros**:
- Real lists and complex forms work on day one.

**Cons**:
- Pays for power no starter app has yet shown it needs, and adds two packages to every copy.

### Option 3: Direct shadcn use with conventions only

No wrappers; docs ask features to import shadcn directly and follow style rules.

**Pros**:
- Zero new code and zero indirection.

**Cons**:
- Conventions without a boundary decay; the audit trail of past apps says drift returns fast.

## Rationale

Option 1 fits the forces in Context. The repo already owns its shadcn copy, so a thin pass through layer is cheap and keeps the escape hatch open. The status chain answers the second gap with one pure function the tests can pin down exactly. Option 2 spends on unproven needs and Option 3 repeats the drift failure this kit exists to prevent. The accepted trade offs are controlled form wiring and a later table upgrade, both recorded as follow ups.

The tie break call (first match in config order inside one priority) is mine: config order reads top down like the priority list itself, so authors predict the winner without learning a second rule. The runner up was most specific match wins, which reads clever but surprises.

Gap closures from the cross check (applied in place): the nine status ids with copy keys and view mapping; the set resolver context plus rule shape plus locale stripping plus the priority first algorithm; null on no match with a dev only warning; the shared action shape plus default icon table plus page replacement rule; form submit time validation with first issue per field plus column shapes with row keys plus loading apart from empty; added props per wrapper; exact banned import paths with one sole entry; the reserved sortable flag.

## References

**Project sources** (verifiable, in this repo):
- `AGENTS.md`, the i18n rules plus the import direction convention
- spec 0001 (`docs/specs/0001-starter-kit-foundation/`), the roles plus flags plus Zod everywhere calls
- `shared/components/ui/`, the owned shadcn primitives this layer wraps

**Practices & standards**:
- Copy in components over installed component packages
- Pure resolver functions for rule driven UI
- Translation keys with build time parity for user copy
- Controlled inputs with schema validation at the boundary

**Links** (web verified only):
- shadcn composition patterns: https://eastondev.com/blog/en/posts/dev/20260401-shadcn-composition-patterns/
- shadcn React 19 support: https://ui.shadcn.com/docs/react-19
- shadcn with Next.js guide: https://noqta.tn/en/tutorials/shadcn-ui-nextjs-component-library-guide-2026

## Landscape scan

1. shadcn ships as copied source with a composable interface (card nests header plus title plus content; dialog nests content plus header plus title), which is why thin wrappers compose cleanly.
2. The community default pairs shadcn forms with a form library plus Zod; this spec deliberately defers the library and keeps Zod, trading less wiring later for zero packages now.
3. Tables commonly pair the shadcn table with a headless table engine for sorting plus filtering plus paging; this spec defers the engine to the first real list.
