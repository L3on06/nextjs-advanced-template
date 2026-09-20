<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# i18n rules (i18next, English + Albanian)

Follow these rules on every change that touches user facing text.

## Translation files

- Live in `shared/translations/`, one flat JSON per locale (`en.json`, `al.json`).
- Flat string keys only, never nested objects. Keys stay identical across all
  files, only values are translated. `shared/translations/index.ts` enforces
  this at build time, so a missing key, an extra key, or a nested value fails
  `tsc` instead of shipping.
- Interpolation uses `{{name}}` placeholders. Never concatenate translated
  fragments in code.

## The one integration point

- `shared/components/i18n/i18n-provider.tsx` owns all locale logic (cookie
  `NEXT_LOCALE`, localStorage, prefix navigation). Import UI pieces only from
  `@/components/i18n` (`I18nProvider`, `T`, `useT`, `useLocale`,
  `useChangeLocale`, `LanguageSwitcher`, `LocaleFlag`). Never import
  `react-i18next` or `i18next` directly in pages or features.
- Config lives in `shared/i18n/settings.ts` (`LOCALES`, `DEFAULT_LOCALE`,
  `LOCALE_META` with flag-icons codes). `proxy.ts` duplicates these constants
  on purpose because edge code must not import shared app modules. Change both
  together when adding a locale.

## Client vs server

- Server components: `const { t } = await getT(locale)` from
  `@/shared/i18n/server` (`server-only` guarded). Cookie mode pages resolve
  the locale with `getServerLocale()`; `app/[locale]/` pages use the URL param
  after an `isLocale()` + `notFound()` check.
- Client components: `<T k="welcome" />` or `const { t } = useT()`. Keys are
  typed as `TranslationKey`, so unknown keys fail `tsc`.
- New user facing string: add the key to `en.json` first, then the same key to
  every other locale file. Never hardcode display text in JSX.

## Routing toggle (.env)

- `NEXT_PUBLIC_I18N_PREFIX_LOCALE=true` serves `/en` and `/al` URLs. `proxy.ts`
  redirects prefixless visits (cookie, then Accept-Language with `sq` mapping
  to `al`, then default) and the switcher pushes prefixed URLs.
- `false` (default) keeps URLs clean. The locale persists in the cookie and
  the switcher swaps language in place plus `router.refresh()`.
- `NEXT_PUBLIC_I18N_DEFAULT_LOCALE` sets the fallback locale.
- `app/[locale]/layout.tsx` validates the param and nests an `I18nProvider`
  inside the root one. Keep both providers wired in any layout refactor.
- Never use `middleware.ts`. Next 16 renamed it to `proxy.ts` and the old
  convention is deprecated.

## Flags

- `LocaleFlag` renders `flag-icons` classes from `LOCALE_META`. The CSS bundle
  import (`flag-icons/css/flag-icons.min.css`) stays in `app/layout.tsx`
  because global CSS may only be imported from a layout. To support a locale,
  extend `LOCALE_META`, no component changes needed.
- The switcher labels each language in its own language (`English`, `Shqip`).
  Never run those labels through `t()`.

# Agent entry point (Starter Kit AI development system)

This is the entry point. Follow it on every task before editing.

## 1. Determine paths, then load skills

1. List every path the task will create, edit, or delete.
2. Resolve each path through `.agents/rules/path-map.md` (the canonical
   path-to-skill mapping; do not guess).
3. Load every matching subsystem skill under `.agents/skills/` plus its related
   blueprint under `docs/blueprints/` before making changes.
4. Load the workflow under `.agents/workflows/` that matches the change type
   (`new-feature`, `bug-fix`, `core-change`, `breaking-change`,
   `dependency-update`, `firebase-change`, `generated-file-change`,
   `starter-kit-update`).
5. A path matching no row uses the closest parent row; a genuinely new top
   level path falls back to the `architecture` skill.

## 2. Global rules

- Ownership: `CORE` is generic and versioned, `GENERATED` is regenerated never
  hand edited, `APPLICATION` holds business logic, `CONFIGURATION` holds env
  and settings, `MIGRATION` holds upgrade notes, `EXTERNAL` holds vendor
  contracts. Full table in `.agents/rules/ownership.md`.
- Imports flow downward only: `app/` → `features/` → `modules/` → `shared/`.
  No upward or circular imports.
- No secrets in the repo. Env is validated with fail fast at boot.
- No business logic in `CORE`. No hardcoded user facing copy, routes, or role
  strings outside their owning modules.
- Never hand edit `node_modules/` or `package-lock.json`. Both are generated
  output, not source. If an install looks broken, remove them and reinstall
  clean instead of patching files inside:
  `rm -rf node_modules package-lock.json && npm install`
  (a clean reinstall is cheaper than debugging dependency drift file by file,
  and it keeps AI token spend low).
- Installing, removing, updating, or otherwise editing a package is a decision,
  not a side effect. Ask first and show why: what breaks or improves, which
  version and why that version, and what else it pulls in. Only run the change
  after confirmation.

## 3. Responsibility split

- `AGENTS.md` holds global rules and this entry procedure.
- `.agents/skills/` holds subsystem-specific rules (one subsystem each).
- `docs/blueprints/` holds architectural contracts.
- `.agents/workflows/` holds procedures.
- Never duplicate one layer's content into another; point at it.
- System overview: `.agents/README.md`.
