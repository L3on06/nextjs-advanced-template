# Workflow: Firebase change

## Trigger

Any edit to init, rules, functions, or Firebase config and env shape.

## Skills to load

`firebase` for init, `firebase-security` for rules, `firebase-functions` for
backend code, plus `permissions` when roles shift and `testing` always.

## Steps

1. Classify the change: init surface, rules tighten, rules widen, function
   logic, function IO, env shape.
2. Rules widening and function IO changes follow `breaking-change`. Rules
   tightening and internal logic stay minor but still need review.
3. Mirror check: the permission model, app guards, and rules must agree. Update
   all three sides in one change when roles shift.
4. Emulator tests for rules and functions before any deploy. Never test against
   production data.
5. Deploy rules and functions together with the app code that depends on them
   where the platform requires it; verify the deployed wiring after.

## Gates

- Deny by default intact; every allow has a test.
- No client only enforcement for anything rules or functions own.
- No production project touched by tests or emulators.
