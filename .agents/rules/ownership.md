# Ownership and imports (global)

## The six areas

- `CORE` — stable, versioned, reusable across apps. Generic only, never business
  specific. Changes follow the `core-change` workflow.
- `GENERATED` — tool output (`setup/` stamps, skill scaffolds). Never hand edit;
  change the generator or template and regenerate.
- `APPLICATION` — the app built on top (`app/`, `features/`, `functions/`).
  Business logic lives here and only here.
- `CONFIGURATION` — environment and settings (env files, root config, `scripts/`).
  Secrets never enter the repo.
- `MIGRATION` — upgrade path (`docs/`, version notes, codemods).
- `EXTERNAL` — outside services (Firebase, vendors). Repo holds contracts and
  config, never vendor internals.

## Path to owner (summary; the spec holds the full table)

`app/`, `features/`, `functions/` → `APPLICATION`. `modules/`, `shared/` → `CORE`.
`setup/`, `scripts/` → `GENERATED`. `docs/` → `MIGRATION`. Env plus root config →
`CONFIGURATION`. Vendor SDKs plus rules files → `EXTERNAL`.

## Import order (enforced)

`app/` may use `features/`, `modules/`, `shared/`. `features/` may use `modules/`,
`shared/`. `modules/` may use `shared/` only. `shared/` uses nothing above it.
`functions/` stands apart for backend units. `setup/`, `scripts/`, `skills/` touch
other paths only at generation time. No upward imports, no circular imports.

## Global invariants

1. No business logic in `CORE`. If only one app can use it, it is not core.
2. No hand edits in `GENERATED`. Regen instead.
3. No secrets in the repo. Env validation fails fast at boot.
4. Every user facing string goes through the translations system.
5. Every change loads its skills first (see `AGENTS.md` entry procedure).
