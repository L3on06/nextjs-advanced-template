# 0003. Design configuration system

**Date**: 2026-09-20
**Status**: In Progress

## Summary

This spec defines the setup time config that drives look plus language: one typed module (a TypeScript file whose shape the build checks) holding theme plus locale choices, semantic CSS variables (meaningful names like primary instead of raw values) as the only styling source, and a local asset pipeline that turns logo uploads into app assets. It lets later app settings read and switch theme with no source edits. It covers visual style, color, radius, type, icons, motion, modes, density, and locales.

## Requirements

**User stories**:
- As an app builder, I want setup to stamp theme plus language config so that every app starts with one look and two locales and no manual wiring.
- As an app user, I want mode plus density plus primary color to switch live so that the app fits my needs with no reload of new code.
- As an app builder, I want logo uploads to become all app assets locally so that branding needs no outside service.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: Setup writes one typed theme plus locale module; invalid values fail the build, proven by a type test with a bad value rejected.
- **AC-2**: Every visual value components use resolves to a semantic CSS variable; a scan of the App layer finds no raw color, font, radius, or motion literals.
- **AC-3**: Mode plus density plus primary color switch at runtime with no rebuild and no source edits, and the choice persists across visits.
- **AC-4**: A light plus dark logo pair uploaded at setup generates icons plus favicons plus social cards locally, and `AppLogo` shows the matching one per resolved theme.
- **AC-5**: The locale config names a default plus additional locales with prefixed routing, and selecting a language generates its message files with mirrored keys.
- **AC-6**: No hardcoded reusable UI string exists in the App layer, proven by a copy scan test.
- **AC-7**: A later settings screen can read and write theme choices through the documented settings API with no source file mutation.

## Decision

**Chosen option**: Typed config module plus semantic variables plus local pipeline.

One TypeScript module carries theme plus locales with build time checks. Light and dark stay on the `class` strategy your Tailwind setup already uses, density rides a `data-density` attribute, and the installed theme provider persists choices. The pipeline rasterizes (converts vector art to pixel files) one SVG source pair into all assets on the maintainer machine at setup time.

**Implementation skills**: `i18next-localization` (`i18next/i18next-cli`, `.agents/skills/i18next-localization/`)

## Feature design

**Data model sketch**:
No stored rows (not applicable). The configured data is two shapes in code. `ThemeConfig`: style name, base color, primary color, radius steps, typography (sans, mono, base size), icons (set name, size scale), animation presets (fast, normal, slow durations plus easings), modes (light, dark, system), density (comfortable, compact). `LocaleConfig`: default locale, additional locales, routing mode (prefixed), message file paths. Both live in one typed module; invalid shapes fail `tsc`.

**State transitions** (if applicable):
No entity state machine (not applicable). Runtime theme state is mode times density times primary, held by the theme provider and persisted in local storage (the browser key value store). Switching writes the attribute or variable and persists; no rebuild, no source edits.

**Closed value sets** (the only legal options plus defaults):
| Group | Options | Default |
|---|---|---|
| Style | minimal, bold, playful | minimal |
| Base color | neutral, slate, stone | neutral |
| Primary swatch | blue, green, violet, amber, rose | blue |
| Radius | 0.5, 0.625, 0.75, 1.0 | 0.75 |
| Sans | Geist, system | Geist |
| Mono | Geist Mono, system | Geist Mono |
| Base size | 14, 16, 18 | 16 |
| Icon set | lucide | lucide |
| Icon sizes | sm, md, lg | md |
| Motion fast | 120 | 120 |
| Motion normal | 200 | 200 |
| Motion slow | 320 | 320 |
| Easing | ease-out | ease-out |
| Modes | light, dark, system | system |
| Density | comfortable, compact | comfortable |

**Wizard to module map** (which setup question fills which field):
Design step fills style plus base plus primary plus radius. Typography fills sans plus mono plus base size. Icons fills set plus sizes. Branding fills logo pair plus brand color. Languages fills default plus additional locales. Invalid setup input fails the stamp closed with the field named; no partial module is ever written.

**Token scheme plus scan rule**:
Variables read `--color-*` for color, `--font-*` for type, `--radius-*` for shape, `--motion-*` for motion. The scan covers `shared/components/app/` plus `shared/states/` and fails on raw literals. Allow list: transparent, currentColor, inherit. Everything else must resolve to a variable.

**Runtime mechanics**:
Primary is chosen from the closed swatch list only, never free hex. Compact density scales the spacing tokens to 0.875 of comfortable. Mode persists under the provider theme key, density under a density key, primary under a primary key, all in local storage. First paint reads the persisted values through the provider inline script so no flash shows. System mode follows the operating system media query and updates live.

**Asset pipeline table** (trigger: branding step upload or new upload rerun; reruns skip byte identical outputs):
| Input | Limits | Outputs |
|---|---|---|
| `logo-light.svg`, `logo-dark.svg` | square viewBox, 512KB max, no scripts | `icon-180.png`, `icon-192.png`, `icon-512.png`, `favicon-32.png`, `favicon-16.png`, `og-light.png` plus `og-dark.png` at 1200 by 630 |
The library pick is a raster package gated by the install policy at build time, with plain SVG output as runner up. Uploads are type plus size plus script checked before anything runs. Manifest plus metadata wire the generated paths; card absolute URLs come from the base URL config.

**API surface**:
| Element | Shape | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| Theme module | typed file | setup values | validated config | none | invalid shape fails build |
| Settings API | read plus write functions | mode, density, primary values | persisted choice | none | unknown value rejected |
| Asset pipeline | local script | light plus dark SVG pair | icons, favicons, social cards | none | bad upload rejected |
| Locale config | typed section | default plus additional locales | routing plus message paths | none | unknown locale falls back |
| `AppLogo` | brand view | light source, dark source, brand color | themed logo | none | missing source falls back to wordmark |
| `AppIcon` | icon view | closed name plus size | icon | none | unknown name fails build |

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):
| Action | Value produced / displayed | Source |
|---|---|---|
| Switch theme | mode plus density plus primary applied | settings API write from the typed module options |
| Render logo | light or dark asset | resolved theme from the provider plus pipeline outputs |
| Render icon | glyph | closed name list plus installed icon set |
| Route locale | active locale | prefixed URL segment with default fallback |
| Render copy | translated strings | message files per selected language |
| Generate assets | icon plus card files | uploaded SVG pair through the local pipeline |

**Locale mechanics**:
Allowed locales are English plus Albanian; adding one is a deliberate follow up, never a drive by edit. New language copy is drafted with AI help then reviewed by a speaker before it ships. Key sets mirror across files and the build fails on drift. Both locales serve prefixed URLs (`/en`, `/al`); prefixless visits redirect by cookie, then browser language with `sq` mapping to `al`, then the default. Cookie memory plus browser fallback stay after prefixing.

**String scope plus naming**:
Every user visible string counts, including assistive labels, image text, metadata, and error copy. Brand names ride an allow list in the app config and never pass through translation. Keys stay flat with group prefixes (`status_`, `action_`, `nav_`, `app_`). Plurals plus interpolation use ICU rules inside message values.

**Settings API signatures**:
`getThemeSettings()` returns mode plus density plus primary. `setThemeSettings(partial)` validates against the closed sets and rejects unknowns. `subscribeTheme(listener)` fires on every change. The store is shared with the provider under the same keys, so settings screens and the provider never disagree. No sign in needed: these are local preferences, with per user sync a later follow up.

**Settled orphans**:
Style names the component shape language, base names the neutral ramp, primary names the accent; the three never overlap. Fonts load through the framework font loader with Geist default and system fallback. Card absolute URLs come from the base URL config. Generated assets plus the typed module are committed; pipeline caches stay ignored.

**Key invariants**:
- Components reference semantic variables only, never raw values.
- Theme writes never mutate source files; provider attributes plus persisted choices only.
- One typed module holds theme plus locales; JSON mirrors are derived, never hand edited.
- Uploads are validated (type plus size) before the pipeline runs.
- Copy flows through translation keys with mirrored key sets.
- The pipeline is a deterministic build script: same SVGs in, same bytes out.
- `AppLogo` resolves through the live theme and falls back to a token wordmark.

**Security model**:
Uploads are size and type checked and processed locally; nothing leaves the machine. No remote asset fetching at runtime. Theme choices hold no personal data. Unknown locales fall back to the default with no content leak.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: setup stamps the module, the build passes, and mode plus density plus primary switch live with persistence, verifies **AC-1**, **AC-3**
- Failure case: an invalid theme value fails the build and an unknown locale falls back to default, verifies **AC-1**, **AC-5**
- Asset case: the logo pair generates the full asset set and the logo follows the resolved theme, verifies **AC-4**
- Contract: scans find no raw visual literals and no hardcoded copy in the App layer, verifies **AC-2**, **AC-6**

## Build plan

Ordered as a thin live thread first (the project default assumption): config plus one switch end to end before the pipeline and the full matrix.

1. Write the typed theme plus locale module with an invalid value type test, satisfies **AC-1**
2. Wire semantic variables plus the provider with mode switching and persistence, satisfies **AC-2**, **AC-3**
3. Add density attribute plus primary switching at runtime, satisfies **AC-3**
4. Build the local asset pipeline plus light and dark logo handling in `AppLogo`, satisfies **AC-4**
5. Lock prefixed routing plus message generation per selected language, satisfies **AC-5**
6. Add the copy scan plus the raw literal scan tests, satisfies **AC-6**
7. Publish the settings API plus a settings read and write test with no source mutation, satisfies **AC-7**

## Consequences

**Positive**:
- Look plus language stamp from one typed source.
- Runtime personalization with no rebuilds.
- Branding with no outside service.

**Negative / tradeoffs**:
- The raster pipeline adds one image package at build time, gated by the install policy.
- Prefixed routing migrates the repo off current cookie mode.
- The typed module is one more file every app carries.

**Neutral**:
- Asset outputs grow the public folder by generated files.

## Follow-up

- [ ] Enroll a scope row for this feature and link this spec on accept.
- [ ] Run the package install gate for the raster library at build time (why, which version, what it pulls in).
- [ ] Plan the cookie to prefix routing migration for the current repo.

## Rationale

Reasoning and options: see `rationale.md`.
