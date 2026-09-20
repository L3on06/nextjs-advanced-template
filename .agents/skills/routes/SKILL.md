---
name: routes
description: "Own the route registry: route names, paths, locale prefixes, and the helpers that build links."
---

## 1. Purpose

Keep every link and redirect derived from one registry so renames and locale
prefixes never scatter hardcoded paths through the app.

## 2. Scope

`shared/routes/**` (route constants, path builders, locale aware link helpers).

## 3. When to use

Adding or renaming a route, building links, wiring locale prefixes, changing
the route group layout structure.

## 4. When not to use

Redirect destinations on deny (use `redirects`). Guarding access (use
`authorization`). Page content and SEO metadata (the feature plus `seo`).

## 5. Required files

`shared/routes/` registry, `proxy.ts` for prefix behavior, the pages being
linked.

## 6. Architecture

Routes are named constants with typed params; builders produce locale aware
paths. Components link by name, never by string literal. The registry mirrors
the `app/` tree.

## 7. Public API

`ROUTES`, `route(name, params?)`, `localizedRoute(name, locale, params?)`,
`Link` wrapper. Dynamic segments are typed and validated.

## 8. Allowed dependencies

`translations` locale helpers. No auth, no data fetching.

## 9. Forbidden patterns

Hardcoded path strings in components. Links that skip the locale prefix.
Route names that drift from the `app/` tree. Params passed unvalidated.

## 10. Security requirements

Never encode access decisions in route names. Guarded routes still require
`authorization` checks; the registry only names paths.

## 11. Testing requirements

Registry tests assert every named route resolves and every `app/` page has a
name. E2E follows key links across both locales.

## 12. Update/versioning requirements

Renames are major: update the registry, redirects for old paths, and call sites
together. New routes are minor.

## 13. Related blueprint

`docs/blueprints/routes.md`

## 14. Examples

```tsx
// components link by name; prefix follows the locale automatically
import { route } from "@/shared/routes";
<Link href={route("project", { id })}>Open project</Link>;
```
