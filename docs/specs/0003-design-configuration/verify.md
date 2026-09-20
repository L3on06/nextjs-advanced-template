# Verify: design configuration · spec 0003 · updated 2026-09-20
_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
## UI / manual
- [ ] Switch mode plus density plus primary → expect live change with persistence across reload → AC-3
- [ ] Upload the logo pair and run assets:build → expect seven files with AppLogo following the theme → AC-4
- [ ] Visit a prefixless URL → expect redirect to the detected locale prefix → AC-5
- [ ] Call the settings API from a scratch screen → expect no source files change → AC-7
## Commands
- [ ] Stamp an invalid primary value → expect the build to fail → AC-1
- [ ] Run the scan tests → expect zero raw literals and zero hardcoded strings → AC-2, AC-6
## Acceptance-criteria coverage
- AC-1 … covered by the invalid value step · AC-2 … covered by the literal scan step · AC-3 … covered by the switching step · AC-4 … covered by the pipeline step · AC-5 … covered by the redirect step · AC-6 … covered by the copy scan step · AC-7 … covered by the settings step
