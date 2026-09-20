# Scope

## Starter foundation

Intent: one neutral base you can copy for many apps, with the locked stack plus folder shape plus six area ownership and no business code.

Done when: the base built from the linked spec typechecks plus lints clean plus builds clean.

Spec: [0001](../specs/0001-starter-kit-foundation/index.md)

1. [x] Decide the stack (spec)
2. [ ] Scaffold from the decision: /develop starter foundation
3. [ ] Verify it: /check verify starter foundation
4. [ ] Test it: /test starter foundation

## UI foundation (in-progress)

Intent: eleven App wrappers over shadcn plus one state view plus one pure status resolver, with all copy translated and features importing App names only.

Done when: screens compose from wrappers, resolved statuses render through AppState, and the import boundary holds in lint plus tests.

Spec: [0002](../specs/0002-ui-foundation/index.md)

Code in: `shared/components/app/`, `shared/states/`

1. [x] Design it (spec)
2. [x] Build it: /develop ui foundation
  - [x] Status spine (AppState, resolver, chain)
  - [x] Wrappers plus form plus table plus page
  - [x] Translations, boundary, docs
3. [ ] Verify it: /check verify ui foundation
4. [ ] Test it: /test ui foundation
