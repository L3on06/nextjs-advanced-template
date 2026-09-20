# Migration notes

## 2026-09-20: prefixed locale routing becomes canonical

`/` now forwards to `/<default-locale>` instead of rendering from the cookie.
Canonical pages live under `app/[locale]/`. The proxy toggle
(`NEXT_PUBLIC_I18N_PREFIX_LOCALE`) still works both ways, but prefix mode is
the locked default per spec 0003. Prefixless bookmarks keep working through
the proxy redirect (cookie, then browser language with `sq` mapping to `al`,
then default). No data migration involved.

## 2026-09-20: translation keys move to dotted form

All message keys now use dot segments (`status.empty.title`) instead of mixed
underscores. The flat map rule is unchanged and `keySeparator: false` keeps
lookups flat. Call sites moved together with the keys in the same change.
