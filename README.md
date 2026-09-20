# nextjs-advanced-template

A reusable Next.js Starter Kit foundation. Copy it, stamp apps from it with the
`setup/` generator, and build business logic on top without touching the core.

## Stack

Next.js 16 · React 19 · strict TypeScript · Tailwind CSS 4 · shadcn/ui ·
Firebase (config and init only) · Zod 4 · Zustand 5 with zenty · next-intl
(English plus Albanian).

## Layout

- `app/` — routes and pages (your application)
- `features/` — app slices (your application)
- `modules/` — shared domain units (stable core)
- `functions/` — Cloud Functions (your application backend)
- `shared/` — stable kits: auth, UI, state, validation, language, Firebase init
- `setup/` — the generator that stamps new apps
- `scripts/` — repeatable chores
- `docs/` — specs, contracts, blueprints, scope
- `skills/` — generator supporting content
- `.agents/` — the AI development system (rules, skills, workflows)

## For AI agents

Start at `AGENTS.md`. It is the entry point: list the paths you will touch,
resolve them through `.agents/rules/path-map.md`, and load the matching skills
and blueprints before editing. System overview: `.agents/README.md`.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result. Edit `app/page.tsx`; the page auto-updates as you edit.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- Architecture decision: `docs/specs/0001-starter-kit-foundation/`
