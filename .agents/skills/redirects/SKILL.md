---
name: redirects
description: "Own redirect destinations: deny flows, locale fallbacks, legacy paths, and post auth landings."
---

## 1. Purpose

Keep every redirect destination consistent so deny, locale, and legacy flows
land users in the right place in every language.

## 2. Scope

`shared/redirects/**` (destination builders, deny flows, legacy path map, post
sign in and sign out landings).

## 3. When to use

Changing where deny lands, adding legacy path aliases, changing post auth
landings, wiring locale fallback redirects.

## 4. When not to use

Deciding whether access is allowed (use `authorization`). Route names and link
building (use `routes`). Proxy mechanics (use `authorization`).

## 5. Required files

`shared/redirects/` modules, `shared/routes/` for target names, `proxy.ts` for
the flows that trigger them.

## 6. Architecture

Destinations are builders over route names, never raw strings. Deny flows
preserve the attempted URL for resume after sign in. Legacy map is versioned and
append only (old links keep working).

## 7. Public API

`denyRedirect()`, `loginRedirect(next?)`, `postAuthLanding()`,
`legacyRedirect(from)`. All return locale aware destinations.

## 8. Allowed dependencies

`routes` registry, `translations` locale helpers. No guards, no data fetching.

## 9. Forbidden patterns

Raw string destinations. Open redirects from user supplied URLs (allowlist
targets). Dropping the resume URL on sign in. Deleting legacy entries.

## 10. Security requirements

Validate every `next` parameter against the route allowlist; never redirect to
arbitrary external URLs from user input. Deny pages reveal nothing about the
protected resource.

## 11. Testing requirements

Tests cover deny with resume, locale fallback, each legacy alias, and rejection
of external `next` URLs. E2E walks sign in resume in both locales.

## 12. Update/versioning requirements

Destination changes are minor unless a public or bookmarked URL moves (then a
legacy alias is required, never a silent break).

## 13. Related blueprint

`docs/blueprints/redirects.md`

## 14. Examples

```ts
// deny with resume — user returns where they were going after sign in
return denyRedirect(verdict, { next: currentPath });
// legacy alias — old marketing link keeps working forever
legacyRedirect("/old-pricing", "pricing");
```
