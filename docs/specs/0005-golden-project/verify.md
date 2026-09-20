# Verify: golden project · spec 0005 · updated 2026-09-20
_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
## UI / manual
- [ ] Open sign in plus themed page plus status wall → expect HTTP 200 on each with all nine statuses visible → AC-3
## Commands
- [ ] Stamp golden inputs into temp → expect setup complete with 25 steps → AC-1
- [ ] Install from the stamp lockfile → expect zero errors → AC-2
- [ ] Run the golden command → expect ordered gates with a JSON report → AC-4
- [ ] Stamp at the previous tag then update to current → expect the migration log plus green gates → AC-5
- [ ] Boot all five emulators with rules tests → expect green → AC-6
- [ ] Break one gate → expect nonzero exit with BLOCKED kept tree → AC-7
- [ ] Add a domain collection to the stamp → expect the audit to fail it → AC-9
## Acceptance-criteria coverage
- AC-1 … covered by the stamp step · AC-2 … covered by the install step · AC-3 … covered by the surfaces step · AC-4 … covered by the command step · AC-5 … covered by the update step · AC-6 … covered by the emulator step · AC-7 … covered by the break step · AC-8 … covered by the report step · AC-9 … covered by the audit step
