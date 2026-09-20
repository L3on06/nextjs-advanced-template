# Workflow: generated-file change

## Trigger

Stamped output needs to change, or someone is tempted to hand edit a generated
file.

## Skills to load

`setup` always, plus the skill owning what the output contains (for example
`translations` for stamped message files).

## Steps

1. Stop: do not edit the generated file. Find the generator, template, or
   schema that produced it.
2. Change the source (template, step, schema) with its tests.
3. Regenerate and diff the output. The diff should show only the intended
   change.
4. Run the shape check plus typecheck on the regenerated output.
5. If the output shape changed for existing stamped apps, ship a migration note
   or codemod per `breaking-change`.

## Gates

- Zero hand edits in `GENERATED` paths.
- Regeneration is clean and reproducible from the repo.
- Shape check green after regen.
