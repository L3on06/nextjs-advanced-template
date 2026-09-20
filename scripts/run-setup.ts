/**
 * Setup wizard CLI runner:
 *   npm run setup -- --target <dir> [--resume] [--force] [--step <id>] [--input <json>]
 *
 * Interactive prompts are out of scope for the foundation: values arrive via
 * --input JSON per step id, secrets via env or the JSON file (never stored).
 * The wizard itself is resumable: rerun the same command to continue after
 * the last completed step, or --step to rerun one step.
 */
import { resolve } from "node:path";
import { Wizard } from "../setup/engine";
import { ALL_STEPS } from "../setup/steps/index";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const targetDir = resolve(flag("--target") ?? process.cwd());
const inputs = flag("--input") ? (JSON.parse(flag("--input") as string) as Record<string, Record<string, unknown>>) : {};
const wizard = new Wizard(ALL_STEPS, {
  targetDir,
  force: process.argv.includes("--force"),
  inputs,
});

const only = flag("--step");
if (only) {
  const step = ALL_STEPS.find((entry) => entry.id === only);
  if (!step) throw new Error(`[setup] Unknown step: ${only}`);
  console.log(JSON.stringify(wizard.runStep(step, inputs[only] ?? {}), null, 2));
} else {
  const results = wizard.runAll();
  for (const result of results) {
    console.log(`${result.id}: ${result.status} (wrote ${result.written.length}, skipped ${result.skipped.length})`);
  }
  const pending = wizard.pendingSteps().map((step) => step.id);
  if (pending.length > 0) console.log(`pending: ${pending.join(", ")}`);
  else console.log("setup complete");
}
