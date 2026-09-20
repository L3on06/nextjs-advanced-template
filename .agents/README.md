# .agents

AI development system for this Starter Kit. It exists so coding agents follow the
architecture instead of inventing their own structure on every task.

## Layout

- `README.md` — this file. What the system is and where things live.
- `rules/` — global, path aware rules. Small files, loaded by `AGENTS.md`.
  - `rules/path-map.md` — the canonical path to skill mapping. Single source of truth.
  - `rules/ownership.md` — the six ownership areas plus the import order rule.
- `skills/` — two kinds of skills live here side by side:
  - Workflow skills (`architect`, `develop`, `check`, `test`, `debug`, `scope`,
    `sync`, `audit`, `document`, `i18next-localization`) — procedures for how to work.
  - Subsystem skills (`architecture`, `setup`, `firebase`, `firebase-security`,
    `firebase-functions`, `authentication`, `authorization`, `permissions`, `routes`,
    `redirects`, `app-state`, `ui`, `components`, `themes`, `icons`, `branding`,
    `translations`, `seo`, `testing`, `starter-updates`) — rules for where to work.
- `workflows/` — procedures for recurring change types (`new-feature`, `bug-fix`,
  `core-change`, `breaking-change`, `dependency-update`, `firebase-change`,
  `generated-file-change`, `starter-kit-update`).

## Responsibilities (kept separate on purpose)

- Root `AGENTS.md` — global rules plus the entry procedure. It tells the agent to
  list the paths it will touch, resolve them through `rules/path-map.md`, and load
  the matching skills and blueprints before editing.
- `rules/` — global constraints every task obeys.
- Subsystem skills — rules for one subsystem only. They never restate the whole
  architecture; they point at it.
- `docs/blueprints/` — architectural contracts (created by the scaffold task;
  each skill names its related blueprint).
- `workflows/` — step by step procedures. They name which skills to load, they do
  not restate skill rules.

## Adding a subsystem skill

1. Create `.agents/skills/<name>/SKILL.md` with the standard 14 sections
   (copy an existing subsystem skill as the template).
2. Add its paths to `rules/path-map.md` only. Never duplicate the table into the
   skill or into `AGENTS.md`.
3. Set its `Related blueprint` to `docs/blueprints/<name>.md`.
4. If it introduces a recurring change type, add a workflow under `workflows/`.
