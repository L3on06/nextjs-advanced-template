# Rationale for 0003 design configuration

## Context

Theme and language choices currently scatter: colors live in CSS, copy lives in message files, brand assets get added by hand, and later settings screens would need source edits to change anything. Each new app repeats the wiring and each personalization request means a code change. A second pressure is branding: logo uploads should become every asset the app needs without sending files to an outside service. The repo already runs cookie based locale mode and class based dark mode, so any prefixed routing or attribute strategy must migrate what exists, not pretend it is greenfield.

Spec 0002 settled the component contracts (`AppIcon` with a closed name list, `AppLogo` with brand props, translation keys for copy) and that work is built. The setup wizard already asks design plus typography plus icons plus branding plus languages questions. What is missing is the typed artifact those answers should produce, the pipeline that turns uploads into assets, and the runtime API that switches theme with no source edits.

## Options considered

### Option 1: Typed module plus semantic variables plus local pipeline

One TypeScript module holds theme plus locales with build time checks, variables carry the look, the installed provider persists mode plus density plus primary, and a local script rasterizes the logo pair into all assets.

**Pros**:
- One source stamps every app and later settings read it with no source edits.
- No outside service ever sees brand files.

**Cons**:
- Adds one image package at build time and migrates locale routing off cookie mode.

### Option 2: JSON config plus CSS only

Plain JSON files for theme plus locales with schema checks, variables only, no TypeScript module and no pipeline (SVG assets only).

**Pros**:
- No new package and the smallest possible artifact.

**Cons**:
- Weaker checks at build time and no raster assets for favicons plus social cards.

### Option 3: Per app hand wiring with docs only

Guidance documents plus the existing wizard questions, each app wires theme plus assets by hand.

**Pros**:
- Zero new code.

**Cons**:
- Repeats the scatter this spec exists to end; settings screens would still need source edits.

## Rationale

Option 1 fits the forces in Context. The wizard already collects the values, so a typed artifact is the natural landing place, and runtime switching with no source edits is the requirement only this option meets fully. The install gate and the routing migration are real costs and both sit as follow ups with owners. Option 2 saves a package but drops the asset promise. Option 3 changes nothing.

Two calls in here are mine. Keeping `class` for light and dark reuses the Tailwind setup and CSS you already ship, while density gets its own attribute so the two never fight. The raster library choice stays open until the install gate at build time, with the SVG only path as runner up if the gate fails.

Gap closures from the cross check (applied in place): closed value sets with defaults; the wizard to module map with fail closed stamps; the token scheme plus scan scope plus allow list; closed primary swatches plus density deltas plus store keys plus no flash plus system resolution; the asset output table plus upload limits plus rerun rules; logo resolution through the live theme; the locale allow list plus copy authorship plus mirror checks plus the redirect table; string scope plus brand allow list plus naming plus plural rules; the settings signatures with shared store; the orphan rulings plus the deterministic build script call.

## References

**Project sources** (verifiable, in this repo):
- `AGENTS.md`, the flat translation rules plus the package install gate
- spec 0002 (`docs/specs/0002-ui-foundation/`), the icon plus logo contracts plus copy key rules
- setup design plus branding plus languages steps, the questions this config answers

**Practices & standards**:
- Semantic variables as the only styling source
- Typed config with build time checks over loose JSON
- Runtime personalization through provider attributes plus persisted choices
- Local asset processing for brand files

**Links** (web verified only):
- next-themes package: https://www.npmjs.com/package/next-themes
- next-themes source: https://github.com/pacocoursey/next-themes

## Landscape scan

1. The installed theme provider supports class plus any data attribute strategies with persistence and system preference, which covers mode on class plus density on an attribute with no extra packages.
2. Attribute strategies keep Tailwind compatibility when the dark value stays explicit, matching the class approach already shipped.
