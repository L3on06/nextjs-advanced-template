---
name: translations
description: "Own user facing copy: message files, locale plumbing, typed keys, and the next-intl migration."
---

## 1. Purpose

Keep every user facing string translated, typed, and routable in English plus
Albanian so no screen ships hardcoded copy.

## 2. Scope

`shared/translations/**`, `shared/i18n/**`, `messages/**`, the i18n provider,
the `T` component and `useT` hook, locale detection order.

## 3. When to use

Adding copy, adding a locale, changing routing mode or detection order, wiring
a new surface into the provider, migrating from i18next to next-intl.

## 4. When not to use

Language names in the switcher (always native: English, Shqip, never run
through `t()`). SEO metadata text (use `seo`, sourced from these messages).
Brand strings structure (use `branding`, values still translated here).

## 5. Required files

`AGENTS.md` i18n rules, the message files, the provider, `proxy.ts` for prefix
behavior, the spec's language routing section.

## 6. Architecture

One integration point owns locale logic (cookie, storage, prefix navigation).
Flat string keys only, identical across locales; interpolation uses named
placeholders, never concatenation. Target shape: `messages/en.json` plus
`messages/al.json` under next-intl with prefixed URLs (`/en`, `/al`), cookie
memory, Accept-Language fallback with `sq` mapping to `al`.

## 7. Public API

`T`, `useT`, `useLocale`, `useChangeLocale`, `LanguageSwitcher`, `LocaleFlag`,
`getT(locale)` server side, `TranslationKey` type. Pages and features import
from the barrel only, never the i18n library directly.

## 8. Allowed dependencies

`next-intl` (target) or current `i18next` plus `react-i18next` until migrated.
`flag-icons` CSS for flags, imported once in the root layout.

## 9. Forbidden patterns

Hardcoded display text in JSX. Nested message objects. Key drift between
locales. Concatenated translated fragments. Importing the i18n library directly
in features. `middleware.ts` (use `proxy.ts`).

## 10. Security requirements

Treat translations as content, not code: no HTML in messages unless sanitized
at render. Locale parameters validated against the known list.

## 11. Testing requirements

Build time key parity check (missing, extra, or nested keys fail `tsc`).
E2E switches locale in both routing modes and asserts translated screens plus
valid locale fallback for unknown codes.

## 12. Update/versioning requirements

New keys land in `en.json` first, then every other locale in the same change.
Routing mode changes are major with a migration note and legacy aliases via
`redirects`.

## 13. Related blueprint

`docs/blueprints/translations.md`

## 14. Examples

```tsx
// client copy — key, not text; params named, never concatenated
import { T } from "@/components/i18n";
<p><T k="welcome" /> {userName}</p>;
// message file — flat, mirrored across locales
{ "welcome": "Welcome", "signIn": "Sign in" }
```
