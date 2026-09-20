---
name: branding
description: "Own brand expression: name, logos, manifest, social cards, and the brand token overlay."
---

## 1. Purpose

Make rebranding a contained task: assets plus metadata plus tokens change in
known places, components stay untouched.

## 2. Scope

`public/brand/**`, `app/manifest.*`, `app/**/opengraph-image.*`,
`app/**/twitter-image.*`, brand token overlay in `shared/themes/`, app display
name and description strings.

## 3. When to use

Changing the app name, logo, manifest, social cards, or brand colors; stamping
a new app with its own brand via `setup`.

## 4. When not to use

Base palette mechanics (use `themes`). Reusable UI (use `components`). Page
copy (use `translations`).

## 5. Required files

Brand assets, manifest, social card files, the brand token overlay, `setup`
templates when the change must stamp into new apps.

## 6. Architecture

Brand lives in three layers: assets (`public/brand/`), metadata (manifest plus
social cards), tokens (brand overlay redefining theme variables). Components
reference tokens and asset paths, never brand literals.

## 7. Public API

Asset paths, manifest fields, token overlay names. Features use the asset and
token names; they never inline brand values.

## 8. Allowed dependencies

`themes` tokens, Next.js metadata APIs. No business imports.

## 9. Forbidden patterns

Brand hex in components. Logos hotlinked from outside. Social cards without
locale aware variants where the brand differs per market. Brand strings
hardcoded outside translations.

## 10. Security requirements

Assets served same origin. Manifest and cards expose no internal URLs or
staging hosts. Image generation routes validate inputs.

## 11. Testing requirements

Manifest validation plus social card render check at required sizes. Visual
review of the brand overlay in light and dark.

## 12. Update/versioning requirements

Brand asset swaps are minor. Token overlay renames are major with a migration
note. Keep stamped templates in sync via `setup` when the brand shape changes.

## 13. Related blueprint

`docs/blueprints/branding.md`

## 14. Examples

```
# rebrand touchpoints — assets, metadata, tokens; components untouched
public/brand/logo.svg
app/manifest.ts          (name, icons, theme_color from tokens)
app/opengraph-image.tsx  (renders brand + translated tagline)
```
