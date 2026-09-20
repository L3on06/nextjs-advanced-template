# Verify: starter update · spec 0004 · updated 2026-09-20
_Steps derived from spec 0004 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
## UI / manual
- [ ] Modify a Core file and run update → expect a per file pick with nothing silent → AC-2
- [ ] Force a migration failure → expect a byte identical tree plus a failure report → AC-4
- [ ] Dirty an Application file and update → expect it untouched → AC-7
- [ ] Open the compatibility guide → expect promises per label → AC-9
## Commands
- [ ] Run starter:check on a clean tree → expect no changes with zero writes → AC-1
- [ ] Run update → expect a backup folder with overwritten files only and no secrets → AC-3
- [ ] Complete an update → expect typecheck plus lint plus tests plus build in order → AC-5
- [ ] Run the matrix suite → expect green → AC-8
## Acceptance-criteria coverage
- AC-1 … covered by the check step · AC-2 … covered by the conflict step · AC-3 … covered by the backup step · AC-4 … covered by the failure step · AC-5 … covered by the gates step · AC-6 … covered by unit tests · AC-7 … covered by the boundary step · AC-8 … covered by the matrix step · AC-9 … covered by the guide step
