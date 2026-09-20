---
name: icons
description: "Own the icon system: lucide usage, shared icon wrappers, and route icon files."
---

## 1. Purpose

One icon language across the app so screens never mix sets, sizes, or stroke
weights. Icons stay decorative or labeled, never ambiguous.

## 2. Scope

`shared/icons/**`, `lucide-react` usage, `app/**/icon.*` and `apple-icon.*`
route files.

## 3. When to use

Adding an icon, wrapping a lucide icon with app defaults, changing icon sizes,
updating favicon or apple touch icons.

## 4. When not to use

Brand logos and artwork (use `branding`). Component structure (use
`components`).

## 5. Required files

`shared/icons/` wrappers, consuming components, the route icon files being
changed.

## 6. Architecture

`lucide-react` is the only icon set. Shared wrappers set default size and
stroke; call sites pass meaning via props or aria labels. Route icons are
generated from vector sources kept beside them.

## 7. Public API

Icon wrapper components with `size` and `label` props. Route icon files follow
Next.js file conventions.

## 8. Allowed dependencies

`lucide-react` only. No other icon packages, no inline SVG dumps in features.

## 9. Forbidden patterns

New icon libraries. Unlabeled icon only buttons. Pixel raster icons where
vector fits. Icons conveying status by color alone.

## 10. Security requirements

Icon files are static and same origin. Never render icon names from user input
as component lookups without an allowlist.

## 11. Testing requirements

Axe check on icon only buttons for accessible names. Visual check on route icon
changes across required sizes.

## 12. Update/versioning requirements

Wrapper prop changes are major with a migration note. `lucide-react` upgrades
are minor unless an icon is renamed or removed (then alias it).

## 13. Related blueprint

`docs/blueprints/icons.md`

## 14. Examples

```tsx
// shared/icons — one set, labeled, sized once
import { Plus } from "lucide-react";
export function AddIcon({ label }: { label: string }) {
  return <Plus size={16} aria-label={label} />;
}
```
