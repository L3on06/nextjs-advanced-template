---
name: themes
description: "Own design tokens: palette, type, radius, and dark mode wiring in CSS first Tailwind 4 style."
---

## 1. Purpose

Keep the look in variables so a rebrand or dark mode fix touches CSS, not every
component. Tokens are the single source of visual truth.

## 2. Scope

`shared/themes/**` (token definitions, palette docs, brand token overlays),
`app/globals.css` theme blocks, `components.json` style settings.

## 3. When to use

Adding or renaming a token, changing the palette, fixing dark mode, adjusting
type scale or radius, onboarding a brand overlay.

## 4. When not to use

Component structure (use `components`). Brand assets and metadata (use
`branding`). One off marketing styles (feature scope, still token based).

## 5. Required files

`app/globals.css`, `shared/themes/` tokens, `components.json`. The screens that
prove light and dark rendering.

## 6. Architecture

CSS first config: tokens live as CSS variables, mapped through `@theme inline`
so dark overrides keep working. Palette in OKLCH. `dark` variant via class on
the root. Brand overlays redefine variables, never component CSS.

## 7. Public API

Token names (`--background`, `--primary`, `--radius`, font vars) plus the
`@theme inline` map. Components consume tokens via utilities, never raw values.

## 8. Allowed dependencies

`tailwindcss`, `tw-animate-css`, `next-themes` wiring. No JS theme objects, no
per component color literals.

## 9. Forbidden patterns

HSL leftovers mixed with OKLCH. `hsl(var(--x))` wrappers (use `var(--x)`
directly). Plain `@theme` for variable backed tokens (breaks dark mode).
Hardcoded hex in components. `tailwind.config.js` (v4 uses CSS).

## 10. Security requirements

No user input in token values. Theme endpoints, if any, serve static CSS only.

## 11. Testing requirements

Visual check of light plus dark on reference screens after any token change.
Contrast review on text tokens. Build must pass (Tailwind catches unknown
tokens).

## 12. Update/versioning requirements

Token renames are major with a find and replace note. Value tweaks are minor.
Palette migrations ship with before and after screenshots.

## 13. Related blueprint

`docs/blueprints/themes.md`

## 14. Examples

```css
/* globals.css — variables carry the palette, @theme inline maps them */
:root { --primary: oklch(0.21 0.02 265); }
.dark { --primary: oklch(0.85 0.02 265); }
@theme inline { --color-primary: var(--primary); }
```
