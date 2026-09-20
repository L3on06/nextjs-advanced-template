---
name: authentication
description: "Own identity: sign in, sign up, session, and sign out. Who the user is, nothing about what they may do."
---

## 1. Purpose

Give every app one identity flow so sessions are handled the same way everywhere.
Authentication proves identity; permission questions belong elsewhere.

## 2. Scope

`shared/auth/**` (providers, session helpers, sign in and sign up UI flows,
session hooks). Firebase Auth via the `firebase` getters.

## 3. When to use

Adding a sign in method, changing session handling or persistence, wiring auth
state into the app shell, touching sign out everywhere behavior.

## 4. When not to use

Role or access decisions (use `authorization` for gates, `permissions` for the
model). Route protection wiring (use `routes` plus `authorization`).

## 5. Required files

`shared/auth/` modules, the `firebase` getters in use, the session consumer
(layout or provider) being changed.

## 6. Architecture

Firebase Auth is the identity provider. A single session provider exposes
`user`, `loading`, and `signOut`. Server components resolve the session server
side; client components consume the hook. Token refresh is the SDK's job, not
app code's.

## 7. Public API

`useSession()`, `getServerSession()`, `signInWithProvider()`,
`signInWithEmail()`, `signUpWithEmail()`, `signOutEverywhere()`. Screens route
by session state through `routes`, never by inline checks.

## 8. Allowed dependencies

`firebase` getters, `zod` for credential forms, `translations` for auth copy.
No business imports inside `shared/auth/`.

## 9. Forbidden patterns

Rolling custom session tokens. Storing tokens in localStorage by hand. Auth
state duplicated per page. Role checks smuggled into auth helpers.

## 10. Security requirements

Never log credentials or tokens. Rate limit and lock out repeated failures.
OAuth callbacks validate state. Password rules and reset flows follow the
blueprint; failures show generic messages.

## 11. Testing requirements

Unit test session state transitions (signed out, loading, signed in, expired).
E2E covers sign in, sign out, and expired session redirect with test accounts
against emulators.

## 12. Update/versioning requirements

New sign in method is minor. Session shape changes are major with a migration
note. Keep the stamped template's auth flow in sync via `setup`.

## 13. Related blueprint

`docs/blueprints/authentication.md`

## 14. Examples

```tsx
// app shell — one session source, screens branch on it
const { user, loading } = useSession();
if (loading) return <AuthSkeleton />;
return user ? <AppShell /> : <SignIn />;
```
