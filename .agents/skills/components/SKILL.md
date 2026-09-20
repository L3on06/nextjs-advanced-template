---
name: components
description: "Own reusable content components: shadcn based primitives and shared composites under shared/components/."
---

## 1. Purpose

Give features copy in components they own instead of rebuilding buttons, cards,
and dialogs per screen. Reuse without drift.

## 2. Scope

`shared/components/**` (shadcn primitives in `ui/`, shared composites, hooks
that serve components).

## 3. When to use

Adding a shadcn primitive, building a composite used by two or more features,
changing a shared component API, adding a component hook.

## 4. When not to use

One screen only widgets (colocate in the feature). Shell and page composition
(use `ui`). Style tokens (use `themes`). Icon additions (use `icons`).

## 5. Required files

The component, its consumer list, `components.json` for shadcn sourcing, the
theme tokens it references.

## 6. Architecture

Primitives are thin shadcn wrappers in `shared/components/ui/`; composites
compose primitives with feature neutral props. Components take translated
strings as props or render `T` children; they never fetch data. Props stay
serializable and controlled where practical.

## 7. Public API

Named exports per component plus props types. Breaking prop changes rename or
codemod; no silent reshapes. Data attributes (`data-slot`) follow shadcn
conventions for styling hooks.

## 8. Allowed dependencies

`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` via `icons`,
`translations` components. No Firebase, no stores, no business imports.

## 9. Forbidden patterns

Data fetching inside shared components. Business specific props or copy baked
in. Forward ref relics on React 19 code. Style overrides that fight the tokens.

## 10. Security requirements

Render user content as text by default; rich HTML only through a sanitizer.
No credentials or tokens in props or stories.

## 11. Testing requirements

Unit tests for behavior and variants; accessibility test per interactive
component (roles, focus, keyboard). Visual check on token changes.

## 12. Update/versioning requirements

Prop removals or renames are major with a codemod or migration note. New
variants are minor. shadcn primitive upgrades follow the upstream guide and run
the component tests.

## 13. Related blueprint

`docs/blueprints/components.md`

## 14. Examples

```tsx
// composite — primitives plus neutral props, copy injected, no fetching
import { Button } from "@/shared/components/ui/button";
export function ConfirmAction({ label, onConfirm }: Props) {
  return <Button onClick={onConfirm}>{label}</Button>;
}
```
