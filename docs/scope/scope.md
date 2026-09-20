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

## Design configuration (in-progress)

Intent: one typed theme plus locale module with semantic variables, live switching, a local asset pipeline, and prefixed routing with generated messages.

Done when: setup stamps the module, theme switches live with persistence, assets generate locally, and scans find no raw literals or hardcoded copy.

Spec: [0003](../specs/0003-design-configuration/index.md)

Code in: `shared/themes/`, `scripts/generate-assets.ts`

1. [x] Design it (spec)
2. [x] Build it: /develop design configuration
  - [x] Typed module plus provider plus density plus primary
  - [x] Pipeline plus logo plus routing plus messages default
  - [x] Scans plus settings API plus docs
3. [ ] Verify it: /check verify design configuration
4. [ ] Test it: /test design configuration

## Starter update (in-progress)

Intent: versioned kit updates with preview, per conflict picks, backup plus rollback, ordered migrations, and full gate validation, never touching Application files or secrets.

Done when: check previews without writing, updates apply with backup and green gates, conflicts ask per file, failures restore byte identical trees, and the matrix passes.

Spec: [0004](../specs/0004-starter-update/index.md)

Code in: `scripts/starter/`, `scripts/starter-check.ts`, `scripts/starter-update.ts`, `migrations/`

1. [x] Design it (spec)
2. [x] Build it: /develop starter update
  - [x] Manifest plus check plus classification
  - [x] Preview plus backup plus apply plus conflicts
  - [x] Migrations plus rollback plus gates plus docs
3. [ ] Verify it: /check verify starter update
4. [ ] Test it: /test starter update
