# Workflow: dependency update

## Trigger

Renovate or a manual bump: SDK, framework, or library version change.

## Skills to load

The skill owning the dependency (`firebase` for the SDK, `themes` or
`components` for styling, `app-state` for Zustand or zenty, `translations` for
i18n libs) plus `testing`.

## Steps

1. Read the upstream changelog for breaking entries before bumping.
2. Bump one dependency family at a time. Never batch unrelated majors.
3. Run typecheck, lint, full unit suite, and the smoke boot. SDK bumps add
   emulator tests; UI bumps add the light plus dark visual check.
4. If peer ranges conflict (for example zenty against Zustand 5), resolve by
   the spec's verify bar: pin, shim, or drop, recorded in the change.
5. Lockfile updated in the same change. Record exact versions in the commit
   message.

## Gates

- Green suite on the bumped family, no unrelated failures hidden.
- Peer conflicts resolved explicitly, never forced with an override flag and
   no note.
- Visual or boot proof where the dependency touches rendering or startup.
