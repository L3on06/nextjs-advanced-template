# 0005 Golden app

## Summary

The golden app is a set of wizard inputs plus three demo surfaces that prove the kit with no business features. It stamps into a temp folder, installs, and serves. Short rationale: temp stamping removes drift, and auth plus theme plus status wall cover identity plus look plus platform states with no domain content.

## Requirements

Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-9** of the umbrella.

## Decision

Stamp inputs enable Firebase with Google plus email providers, Firestore plus Storage plus Functions, all five emulators, RBAC with the starter roles, routes plus redirects plus AppState plus statuses, themes plus icons plus branding, both locales, SEO defaults, and the error catalog. Demo surfaces are sign in (emulator backed, demo config, no real OAuth), one themed page showing mode plus density plus primary switching, and a status wall rendering all nine statuses through `AppState`. Content audit forbids domain collections, screens, or copy beyond the starter set.

**Golden inputs** (checked in as `golden-inputs.json`, literal values):
Theme minimal with neutral base, blue primary, 0.75 radius, Geist fonts, lucide icons, light plus dark plus system modes, comfortable density. Brand Starter Gold with a blue mark. Locales English default plus Albanian with prefixed routing. Roles viewer plus editor plus admin. Emulator ports at the kit defaults. Functions region matching the kit default. SEO site Golden Starter with the local base URL. No extra routes, no extra resources, no extra statuses.

**Serving pass rules**:
Sign in page answers HTTP 200 with demo users seeded in the Auth emulator and the emulator Google flow completing without real OAuth. Themed page answers HTTP 200 and switches mode plus density plus primary live. Status wall answers HTTP 200 with all nine statuses visible, each through `AppState`.

**Content audit**:
A checked in starter allow list names every permitted collection, route, key group, and asset. The audit script runs right after stamping and fails the run on anything outside the list.

## Build plan

1. Set the golden inputs file plus the temp stamp step, satisfies **AC-1**
2. Serve the three demo surfaces with starter content only, satisfies **AC-3**
3. Prove clean install plus the content audit, satisfies **AC-2**, **AC-9**
