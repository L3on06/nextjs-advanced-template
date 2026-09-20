<!-- GENERATED — do not hand edit. Source: shared/permissions/config.ts. -->
# Permissions

Single source of truth: `shared/permissions/config.ts`. Route access governs
reachability only and never implies data access; Firestore and Storage access
come from the separate resource policies below.

## Roles

- `viewer`
- `editor`
- `admin`

## Permission grants

| permission | roles |
|---|---|
| `profile:read` | viewer, editor, admin |
| `profile:write` | viewer, editor, admin |
| `users:read` | admin |
| `users:manage` | admin |
| `invites:manage` | editor, admin |
| `settings:view` | editor, admin |

## Routes (reachability, not data access)

| route | path | access |
|---|---|---|
| `home` | `/` | public |
| `signIn` | `/sign-in` | public |
| `dashboard` | `/dashboard` | signed in |
| `profile` | `/profile` | signed in |
| `settings` | `/settings` | permission `settings:view` |
| `admin` | `/admin` | roles: admin |

## Navigation (visibility, not security)

| item | route | visibility |
|---|---|---|
| `home` | `home` | public |
| `dashboard` | `dashboard` | signed in |
| `settings` | `settings` | permission `settings:view` |
| `admin` | `admin` | roles: admin |

## Features

| feature | access |
|---|---|
| `userProfiles` | signed in |
| `userManagement` | permission `users:manage` |
| `inviteTeammates` | permission `invites:manage` |

## Firestore resources

### `users` (`users/{userId}`)

| op | policy |
|---|---|
| get | owner (`userId`) OR roles: admin |
| list | deny |
| create | owner (`userId`) AND shape ["uid","email","displayName","roles"] + fixed {"uid":"{userId}","roles":["viewer"]} |
| update | owner (`userId`) AND unchanged: roles OR roles: admin |
| delete | roles: admin |

### `invites` (`invites/{inviteId}`)

| op | policy |
|---|---|
| get | permission `invites:manage` OR invitee email match |
| list | permission `invites:manage` |
| create | permission `invites:manage` |
| update | permission `invites:manage` OR status pending → accepted, frozen email, role |
| delete | permission `invites:manage` |

## Storage resources

| resource (path) | read | write | max bytes |
|---|---|---|---|
| `userFiles` (`users/{userId}/{filePath=**}`) | owner (`userId`) | owner (`userId`) | 10485760 |

## Application statuses

| lifecycle | values in order |
|---|---|
_No application statuses defined yet (setup step: application-statuses)._
