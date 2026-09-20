# Path to skill mapping (canonical)

Single source of truth. `AGENTS.md` points here; skills and workflows point here.
Edit this table only, never copy it into skills or workflows.

| Path | Skill |
|---|---|
| `docs/specs/**`, `docs/ARCHITECTURE.md`, `docs/CORE-CONTRACT.md`, `docs/VERSIONING.md` | `architecture` |
| `setup/**` | `setup` |
| `shared/firebase/**` | `firebase` |
| `firestore.rules`, `storage.rules`, `firebase.json` | `firebase-security` |
| `functions/**` | `firebase-functions` |
| `shared/auth/**` | `authentication` |
| `proxy.ts`, route guards, server action guards | `authorization` |
| `shared/permissions/**` | `permissions` |
| `shared/routes/**` | `routes` |
| `shared/redirects/**` | `redirects` |
| `shared/states/**`, `features/*/states/**` | `app-state` |
| `shared/ui/**` | `ui` |
| `shared/components/**` | `components` |
| `shared/themes/**` | `themes` |
| `shared/icons/**`, `app/**/icon.*`, `app/**/apple-icon.*` | `icons` |
| `public/brand/**`, `app/manifest.*`, `app/**/opengraph-image.*` | `branding` |
| `shared/translations/**`, `shared/i18n/**`, `messages/**` | `translations` |
| `app/**/page.tsx` metadata, `app/sitemap.*`, `app/robots.*` | `seo` |
| `e2e/**`, `**/*.test.*`, `**/*.spec.*`, `vitest.config.*`, `playwright.config.*` | `testing` |
| `.agents/**`, `skills-lock.json`, `docs/blueprints/**` | `starter-updates` |

## Resolution rules

1. List every path the task will create, edit, or delete before loading anything.
2. A path matching no row uses the closest parent row; a genuinely new top level
   path falls back to `architecture`.
3. A task touching rows from more than one skill loads every matching skill.
4. Workflows name extra skills beyond the touched paths (for example `bug-fix`
   always adds `testing`).
