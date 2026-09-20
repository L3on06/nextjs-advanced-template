# Project Setup wizard

Configures generated application source code. Not a production runtime
settings editor: it stamps files, it never edits live settings.

Run it:

```bash
npm run setup -- --target <dir> --input '<step-id to values JSON>'
npm run setup -- --target <dir> --step <id> --input '{...}'  # rerun one step
npm run setup -- --target <dir> --force                       # allow overwrites
```

The wizard is resumable (state in `<target>/.setup-state.json`, rerun continues
after the last completed step) and idempotent (byte identical reruns write
nothing). Cancel anytime with `wizard.cancel()` or by stopping the process;
resume with the same command.

## Guarantees

- Secrets never enter setup state. Secret fields go runtime only: CLI input or
  env straight into generated files (`.env.local`), never into
  `.setup-state.json`. A test asserts this.
- Never writes outside the allowlisted directory (defaults to cwd). Escape
  attempts throw. A test asserts this.
- Never overwrites application owned files silently. Files the wizard did not
  create require `--force`. A test asserts this.
- Reruns detect existing generated files and preserve valid configuration:
  valid indexes, messages, and tokens survive; stale outputs regenerate.

## The 25 steps

| # | id | owns |
|---|---|---|
| 1 | bootstrap | `.gitignore` managed block |
| 2 | firebase-project | `.firebaserc` |
| 3 | firebase-auth | `shared/auth/generated-config.ts` |
| 4 | firebase-admin | `.env.local` merge (secrets) or nothing (emulator) |
| 5 | emulator | `firebase.json` emulators section |
| 6 | firestore | `firebase.json` firestore section, `firestore.indexes.json` starter |
| 7 | storage | `firebase.json` storage section |
| 8 | functions | `functions/` scaffold (application owned, written once) |
| 9 | app-metadata | `shared/app-meta/generated.ts` |
| 10 | design | `shared/themes/generated-tokens.css` design section |
| 11 | typography | same file, typography section (marker merge) |
| 12 | icons | `shared/icons/generated.json` |
| 13 | branding | `public/brand/logo.svg`, `public/brand/og.svg` |
| 14 | languages | `messages/<locale>.json` starter keys (existing copy wins) |
| 15 | roles | `shared/permissions/overrides.json` roles |
| 16 | permissions | `shared/permissions/overrides.json` grants |
| 17 | resources | `shared/permissions/overrides.json` firestore/storage resources |
| 18 | routes | `shared/permissions/overrides.json` routes |
| 19 | navigation | `shared/permissions/overrides.json` navigation |
| 20 | redirects | `shared/redirects/generated.ts` |
| 21 | application-statuses | overrides statuses plus `shared/states/generated-statuses.ts` |
| 22 | errors | `shared/errors/generated.ts` |
| 23 | seo | `shared/seo/generated.ts` (reuses metadata from state) |
| 24 | review | `docs/SETUP-REVIEW.md` (regenerates when prior values change) |
| 25 | generate | compiles `firestore.rules`, `storage.rules`, `docs/PERMISSIONS.md`, seals `.setup-complete.json` |

Every step defines schema, UI descriptor, validation, detection, generation,
tests, and docs. `setup/engine.test.ts` enforces this shape for all 25, and
`StepForm` in `setup/ui.tsx` renders every step from its descriptor, so a step
cannot forget its UI.

## Rules over code

Route permissions never imply data access. The final stamp compiles the
authorization model (base config plus wizard overrides) into platform outputs.
No business specific code is generated: collections beyond the starter set are
owner scoped gates only, field modeling stays in features.
