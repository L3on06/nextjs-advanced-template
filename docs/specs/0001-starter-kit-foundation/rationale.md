# Rationale for 0001 starter kit foundation

## Context

Many teams copy a past app to start a new one. The copy carries old business rules and old styles and old keys. Each new app then drifts a little more. Fixes in one copy never reach the others.

You need one neutral base you can copy with trust. The base must stay free of business code. It must show where app code lives and where shared core lives. It must make upgrades and vendor ties visible so you can move with care.

Your repo today holds a working web app shell with Next plus React plus strict types plus Tailwind plus shadcn style UI plus i18next for English and Albanian. The brief asks for Firebase plus Zod plus Zustand with zenty plus next intl where useful. The open risk is version drift and unclear ownership as the base grows.

## Options considered

### Option 1: Unified monolith starter

Single web app base with the locked stack and the six area split and docs plus blueprints plus a shape check.

**Pros**:
1. Smallest unit you can run and copy with ease.
2. One place for core fixes to reach all apps.

**Cons**:
1. Needs a real i18n move plus a real state verify pass.

### Option 2: Docs only base

Only docs and rules with no runnable shape check and no init helpers.

**Pros**:
1. Least work to start.

**Cons**:
1. No proof that copies keep the shape, drift returns fast.

### Option 3: Split services starter

Separate front plus back units from day one with shared contracts.

**Pros**:
1. Clear seam if a team must scale parts alone.

**Cons**:
1. More repos and deploys and contracts for gain you do not yet need.

## Rationale

Option 1 fits the forces in Context. You need trust across copies and visible ownership and low ops load. A single unit gives you that with the least moving parts. Docs only leaves drift unchecked. Split services adds cost before you feel pain. The trade offs you accept are a focused i18n move and a focused state verify, both small and one time.

Gap closures from the cross check (each a small call with its runner up in the index): import order locked to keep layers clean; ownership mapped to disk so edits land in the right area; prefixed locale URLs for shareable links; Firebase init surface with Zod env fail fast; parse once at the edge with one error shape; collocated client only stores with a tiny verify bar for the Zustand 5 plus zenty pair; managed hosting with preview deploys plus Node 22 plus npm lockfile; structured JSON logs with hashed user id and no private data. Vendor names for host and tracker stay open as follow ups.

## References

**Project sources** (verifiable, in this repo):
1. `AGENTS.md`, current i18next rules with flat JSON and typed keys
2. `package.json`, current Next plus React plus Tailwind plus shadcn style setup
3. `.agents/skills/`, installed workflow skills used for later builds

**Practices and standards**:
1. Monolith first for small teams
2. Boring technology over novelty
3. Parse once at the edge for inputs
4. Observability from day one
5. Simple beats clever for daily work
6. Layered monolith pattern
7. CSS first tokens practice

**Links** (web verified only):
1. shadcn Tailwind v4 guide: https://ui.shadcn.com/docs/tailwind-v4
2. Firebase JS SDK release notes: https://firebase.google.com/support/release-notes/js
3. zenty docs: https://zentylib.com/docs
4. next intl docs: https://next-intl.dev/
5. zustand package: https://www.npmjs.com/package/zustand
6. zod v4 guide: https://zod.dev/v4

## Landscape scan

1. `next` 16 with `react` 19 plus `tailwindcss` 4 plus shadcn 2.3.0 is the current first class path with CSS first tokens and OKLCH palette and `tw-animate-css` for motion.
2. `firebase` 12.18.0 is latest in August 2026 per release notes.
3. `zenty` 1.0.8 of July 2025 lists `zustand` 4 as peer while `zustand` 5.0.15 is current, so verify before you lock.
4. `next-intl` 4.14.2 supports `next` 12 to 16 and `react` 16 to 19 per registry.
5. `zod` 4.5.4 is current with compile helpers and locales per release notes.
