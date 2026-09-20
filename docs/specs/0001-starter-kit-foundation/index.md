# 0001. Starter kit foundation

**Date**: 2026-09-20
**Status**: Accepted

## Summary

This spec sets the base for a reusable Next.js starter kit (a clean starting point you can copy for many apps). It locks the stack, the folder shape, and the ownership split so later apps share one stable core. It keeps business code out so the base stays neutral and easy to reuse.

## Decision

**Chosen option**: Unified monolith starter on Next.js with Firebase plus Zod plus Zustand 5 with zenty plus next intl.

You get a single deployable web app (one unit you build and ship together) with server rendering where it helps (pages rendered on the server for speed and search) and client parts only for interaction (small islands in the browser for clicks and state).

The folder shape is `app/` plus `features/` plus `modules/` plus `functions/` plus `shared/` plus `setup/` plus `scripts/` plus `docs/` plus `skills/` plus `.agents/`.

Ownership uses six areas. `CORE` is stable and versioned (the part you trust across apps). `GENERATED` is tool output (files a generator writes, you may regen). `APPLICATION` is your code (the app you build on top). `CONFIGURATION` is env and settings (keys and toggles per deploy). `MIGRATION` tracks upgrades (notes that move you from old to new). `EXTERNAL` tracks outside services (Firebase and other vendors).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | `TypeScript` strict | Strict types catch shape errors early with plain compiler checks (basis: your `package.json`, strict mode today) |
| Framework | `next` 16 with `react` 19 | Single web framework with server rendering plus client islands for speed and simple ops (basis: your `package.json`, current Next setup; layered monolith pattern) |
| Styling | `tailwindcss` 4 with `tw-animate-css` | Utility styles in CSS with tokens in CSS for theme and motion (basis: shadcn Tailwind v4 guide, CSS first tokens practice) |
| UI | shadcn with `new-york` style and `lucide-react` icons | Copy in components you own plus consistent icons for a calm look (basis: shadcn Tailwind v4 guide, boring technology practice) |
| Language scope | `next-intl` 4.14.2 with English plus Albanian | Messages per locale with typed keys for safe copy (basis: your move to next intl call; next intl docs) |
| Backend | `firebase` 12.18.0 config and init only | Config plus typed init plus emulator helpers with no business models (basis: your config and init only call; Firebase release notes) |
| Validation | `zod` 4.5.4 everywhere | One schema shape for env plus forms plus server inputs (basis: your Zod everywhere call; parse once at the edge practice) |
| State | `zustand` 5.0.15 with `zenty` 1.0.8 | Small client stores with ready entity helpers for lists (basis: your Zustand 5 with verify call; simple beats clever practice) |
| Hosting | Managed app platform | You ship one unit with no servers to tend (basis: monolith first practice) |
| Observability | Structured logs plus error tracking from day one | You see failures fast with plain searchable events (basis: observability from day one practice) |

## Folder imports

Allowed order is `app/` may use `features/` plus `modules/` plus `shared/`. `features/` may use `modules/` plus `shared/`. `modules/` may use `shared/` only. `shared/` uses nothing above it. `functions/` stands apart for backend units. `setup/` plus `scripts/` plus `skills/` touch any path only at gen time. I recommend you enforce this with an import lint rule plus the shape check (runner up is docs only with no lint, which lets drift return).

## Ownership map

| Path | Owner | Note |
|---|---|---|
| `app/` | `APPLICATION` | Your routes and pages live here (basis: your six area call) |
| `features/` | `APPLICATION` | Your app slices live here |
| `modules/` | `CORE` | Shared domain units you reuse across apps |
| `functions/` | `APPLICATION` | Backend units with ties to `EXTERNAL` |
| `shared/` | `CORE` | Stable kits for UI plus state plus validation plus language |
| `setup/` | `GENERATED` | Tooling you run to stamp new apps |
| `scripts/` | `GENERATED` | Repeatable chores you run from the shell |
| `docs/` | `MIGRATION` | Contracts plus versions plus upgrade notes |
| Root config plus env | `CONFIGURATION` | Keys and toggles per deploy |
| Vendor SDKs plus vendor docs | `EXTERNAL` | Firebase and other outside services |

## Language routing

I recommend prefixed URLs with `next-intl` (`/en` plus `/al`) as primary since links stay shareable and search friendly (a link that carries its locale opens right for everyone). Cookie remembers the pick. Accept Language is the fallback with `sq` mapping to `al`. Message files stay flat (`messages/en.json` plus `messages/al.json`, one level keys only) to keep the typed key contract you have today. Runner up is clean cookie only URLs, which keeps links shorter but hides locale from the link.

## Firebase surface

Client init uses `firebase/app` first with lazy getters for Auth plus Firestore plus Storage and no business models. Admin init is server only and guarded by env presence. Env is validated by Zod at boot with fail fast (the app refuses to start with bad keys, so bad config shows at once). Keys used are `NEXT_PUBLIC_FIREBASE_API_KEY` plus `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` plus `NEXT_PUBLIC_FIREBASE_PROJECT_ID` plus `FIREBASE_ADMIN_PROJECT_ID` plus `FIREBASE_ADMIN_CLIENT_EMAIL` plus `FIREBASE_ADMIN_PRIVATE_KEY`. Emulator hooks stay dev only. Runner up is config only with no getters, which leaves each app to wire init alone.

## Data contract

Schemas live in `shared/schemas/` with Zod 4. Parse once at the edge (check inputs where they enter, at server actions and route handlers, so inner code trusts the shape). Shared error shape is `{ ok, data, error }` where error carries `code` plus `message` plus optional `field`. Forms show the `field` message beside its input. Runner up is per feature schemas with no shared shape, which splits error handling across apps.

## State pattern

Stores live beside their feature in `states/` (state kept near the screen that owns it) and cross app stores live in `shared/states/`. Stores are client only with no persist at first. Verify bar is a tiny entity store test under Zustand 5 with zenty that must pass before you lock. If it fails, pin `zustand` 4 or drop zenty for plain Zustand. Runner up is plain Zustand from day one, which removes the peer risk but writes more list helpers by hand.

## Hosting and ops

I recommend a managed app platform with preview deploys (each pull request gets its own live link for review) plus `node` 22 plus npm with `package-lock.json` plus exact pins recorded at build time. Vendor name stays a follow up so you may pick the host you already pay for. Runner up is any container host, which adds ops load with no gain at this size.

## Observability

Logs are structured JSON (plain fields a machine can search) with request id plus route plus locale plus a user id that is hashed where private. Error tracker key arrives by env and stays server guarded. No private data lands in logs. Vendor name stays a follow up. Runner up is console text only, which reads fine early and hurts once apps multiply.

## Consequences

**Positive**:
1. One base serves many apps with less drift across copies.
2. Clear ownership tells you what to edit and what to leave alone.
3. Small proven stack keeps daily work calm and easy to staff.

**Negative and trade offs**:
1. Moving from i18next to next intl costs a migration of keys and provider wiring.
2. Zustand 5 with zenty needs a real verify pass since zenty lists Zustand 4 as peer.
3. Firebase stays thin at first so early apps write a little more glue.

**Neutral**:
1. Docs plus blueprints plus a shape check ship first, full generators wait.

## Follow up

1. [ ] Verify `zenty` 1.0.8 with `zustand` 5.0.15 in a tiny store and pin or shim as needed.
2. [ ] Migrate `shared/translations/` plus provider plus `proxy.ts` to `next-intl` and keep English plus Albanian.
3. [ ] Add `AGENTS.md` plus `ARCHITECTURE.md` plus `SECURITY.md` plus `docs/CORE-CONTRACT.md` plus `docs/VERSIONING.md` plus `docs/blueprints/` plus starter skill plus rules plus workflows.
4. [ ] Record the setup shape check so `setup/` proves the folder split on every run.

## Rationale

Reasoning and options: see `rationale.md`.
