---
name: ui
description: "Own the UI shell: layout, theming wiring, motion, and the page composition rules every screen follows."
---

## 1. Purpose

Keep screens consistent without freezing their content. This skill governs the
shell and the rules; features own what goes inside.

## 2. Scope

`shared/ui/**` (shell components, theme provider wiring, motion presets, empty
and error and loading states). Page composition order per screen type.

## 3. When to use

Changing the app shell, adding a shell level state, adjusting motion presets,
defining a screen's section order, touching theme wiring.

## 4. When not to use

Reusable content components (use `components`). Tokens and palettes (use
`themes`). Copy and locale mechanics (use `translations`).

## 5. Required files

`shared/ui/` shell, `app/layout.tsx`, `app/globals.css`, the screen being
composed.

## 6. Architecture

Server Components render the shell; interactive islands are client components at
the leaves. Every screen declares its sections in order and its loading, empty,
and error states up front. Motion comes from presets, never inline experiments.

## 7. Public API

`AppShell`, `PageHeader`, `EmptyState`, `ErrorState`, `LoadingState`, motion
presets. Screens compose these; they do not restyle them per page.

## 8. Allowed dependencies

`components` primitives, `themes` tokens, `translations` copy, `next-themes`.
No data fetching in shell components.

## 9. Forbidden patterns

Per page shell forks. Client components above content that could render on the
server. Inline animation values outside presets. Text outside the translation
system.

## 10. Security requirements

Shell never renders unsanitized HTML. Error states reveal no internals or stack
traces. Loading states do not leak the existence of guarded content.

## 11. Testing requirements

Shell tests assert provider wiring and theme attribute. Screens get
accessibility checks for landmarks and headings. Visual review per screen type.

## 12. Update/versioning requirements

Shell API changes are major with a migration note across screens. New presets
are minor. Motion default changes need a visual sign off.

## 13. Related blueprint

`docs/blueprints/ui.md`

## 14. Examples

```tsx
// screen composition — order declared, states covered, shell untouched
<PageHeader title={t("projects.title")} action={<NewProject />} />
<Suspense fallback={<LoadingState />}>
  <ProjectList />
</Suspense>
<EmptyState hidden={count > 0} />
```
