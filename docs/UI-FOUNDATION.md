# UI foundation usage

Features compose screens from `App` names imported from `@/components/app`.
Never import shadcn primitives (`@/components/ui/*`) outside `shared/`. The
lint rule enforces this; the probe test proves it.

## Wrappers

`AppButton`, `AppInput` (plus `fieldError`), `AppSelect` (translated options,
controlled only), `AppDialog` (controlled only: one instance serves a whole
table), `AppCard`, `AppTable` (typed columns, `rowKey`, loading skeletons apart
from empty), `AppForm` (controlled values, Zod validated on submit, first issue
per field), `AppPage` (title plus actions plus content; a state node replaces
content when present), `AppIcon` (closed name list, three sizes), `AppLogo`
(brand props or the translated title wordmark), `AppState` (the only status
view: variant plus title plus message plus optional action).

## Statuses

`resolveStatus(ctx, rules?)` in `shared/states` is pure: route plus roles plus
permissions plus flags plus session plus online state in, one of nine statuses
or null out. Priority is global, path, role, permission, feature. Ties break by
config order inside one priority. Paths strip `/en` and `/al` first. Prefix
rules match whole segments only. Null renders nothing plus a dev only warning.
`resolveAppState` maps the winner to `AppState` props with translated copy.
Add app rules by appending to the rule list; never branch statuses in pages.
