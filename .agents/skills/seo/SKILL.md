---
name: seo
description: "Own discoverability: metadata, social cards data, sitemap, robots, and canonical URLs for public routes."
---

## 1. Purpose

Make public pages indexable and shareable with correct titles, descriptions,
and cards in every locale, without leaking private routes to crawlers.

## 2. Scope

Route `metadata` exports, `app/sitemap.*`, `app/robots.*`, canonical URL
builders, JSON-LD structured data.

## 3. When to use

Adding a public page, changing titles or descriptions, adding structured data,
changing which routes are indexed, fixing social card content.

## 4. When not to use

Page body copy (use `translations`). Card image rendering (use `branding`).
Route protection (use `authorization`).

## 5. Required files

The page's metadata export, `shared/routes/` for canonical names, message files
for translated metadata, sitemap and robots files when coverage changes.

## 6. Architecture

Metadata is generated per locale from translated messages, with canonical URLs
built from route names. Sitemap lists public locale prefixed URLs only.
JSON-LD mirrors visible content, nothing more.

## 7. Public API

`generateMetadata()` per public route, `sitemap()` entries, `robots()` rules.
All URLs flow through the canonical builder.

## 8. Allowed dependencies

`routes` builders, `translations` messages, Next.js metadata APIs. No client
only data in metadata.

## 9. Forbidden patterns

Hardcoded titles bypassing messages. Guarded routes in the sitemap. Duplicate
content across locales without canonicals. Social cards pointing at staging
hosts.

## 10. Security requirements

Never expose guarded or user specific data in metadata or structured data.
Validate route params before rendering metadata.

## 11. Testing requirements

Unit test canonical builder output per locale. Assert guarded routes absent from
the sitemap. Spot check rendered metadata in E2E for key public pages.

## 12. Update/versioning requirements

Metadata copy changes are minor. URL moves require legacy aliases via
`redirects`. Sitemap coverage changes ship with the route change.

## 13. Related blueprint

`docs/blueprints/seo.md`

## 14. Examples

```ts
// app/projects/page.tsx — metadata from messages, URLs from route names
export async function generateMetadata({ params }: Props) {
  const { t } = await getT(params.locale);
  return { title: t("projects.seoTitle"), alternates: { canonical: route("projects") } };
}
```
