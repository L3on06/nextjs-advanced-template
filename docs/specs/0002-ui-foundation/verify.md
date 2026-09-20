# Verify: ui foundation · spec 0002 · updated 2026-09-20
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
## UI / manual
- [ ] Force the maintenance flag → expect the warning view with translated copy → AC-6, AC-7, AC-8
- [ ] Submit an invalid form → expect one error per bad field, no submit call → AC-2
- [ ] Load a table with zero rows → expect the empty view; then loading → expect skeletons → AC-3
- [ ] Open a page with a state node → expect content replaced → AC-4
- [ ] Resolve an unknown path → expect no view plus a dev warning → AC-6
## Commands
- [ ] Add a feature file importing `@/components/ui/button` → expect the lint rule to fail it → AC-1
## Acceptance-criteria coverage
- AC-1 … covered by the lint probe step · AC-2 … covered by the form step · AC-3 … covered by the table step · AC-4 … covered by the page step · AC-5 … covered by unit tests · AC-6 … covered by resolver plus fallback steps · AC-7 … covered by the chain step · AC-8 … covered by the copy step · AC-9 … covered by code review (no per status components)
