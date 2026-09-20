/**
 * npm run starter:update -- --release <dir|git-ref> [--dry-run] [--non-interactive] [--pick <path>=mine|theirs]
 * Preview, confirm, backup, apply, migrate, validate. Rollback on failure.
 */
import { createInterface } from "node:readline";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { MIGRATIONS } from "../migrations/index";
import { fingerprintFile, loadManifest, saveManifest, type StarterManifest } from "./starter/manifest";
import { applicableMigrations, runMigrations } from "./starter/migrate";
import {
  createBackup,
  inspect,
  restoreBackup,
  runGates,
  type ChangeEntry,
} from "./starter/update";
import { resolveRelease } from "./starter-check";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function has(name: string): boolean {
  return process.argv.includes(name);
}

function picks(): Record<string, "mine" | "theirs"> {
  const out: Record<string, "mine" | "theirs"> = {};
  for (const arg of process.argv) {
    const match = arg.match(/^--pick=(.+)=(mine|theirs)$/);
    if (match) out[match[1]] = match[2] as "mine" | "theirs";
  }
  return out;
}

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await new Promise((resolve) => rl.question(question, resolve));
  } finally {
    rl.close();
  }
}

async function main(): Promise<number> {
  const root = process.cwd();
  const ref = flag("--release");
  if (!ref) throw new Error("[starter] Missing --release <dir|git-ref>.");
  const dryRun = has("--dry-run");
  const nonInteractive = has("--non-interactive");
  const preset = picks();

  const manifest = loadManifest(root);
  const before = JSON.parse(JSON.stringify(manifest)) as StarterManifest;
  const { release, cleanup } = resolveRelease(root, ref);
  try {
    const entries = inspect(root, release);
    if (entries.length === 0) {
      console.log(`starter ${manifest.kitVersion}: already current.`);
      return 0;
    }
    printPreview(entries);

    if (dryRun) {
      console.log("dry run: zero writes performed.");
      return 0;
    }

    const choices = await resolveConflicts(entries, preset, nonInteractive);
    if (choices === null) {
      console.log("stopped on unresolved conflicts. Tree and backup untouched.");
      return 2;
    }

    const toWrite = entries.filter(
      (entry) => entry.conflict === "clean" || entry.conflict === "added" || choices[entry.path] === "theirs",
    );
    const backup = createBackup(root, [...toWrite.map((entry) => entry.path), ...removedPaths(entries)]);
    applyEntries(root, release.root, entries, choices);

    const releaseManifest = readReleaseVersion(release.root);
    const migrations = applicableMigrations(manifest.kitVersion, releaseManifest, MIGRATIONS);
    const reports = runMigrations(root, migrations);
    for (const report of reports) console.log(`migrated ${report.version}: ${report.changed.length} files`);

    refreshManifest(root, manifest, toWrite, entries, releaseManifest, reports.map((report) => report.version));
    saveManifest(root, manifest);

    const gates = runGates(root);
    const failed = gates.find((gate) => !gate.ok);
    if (failed) {
      console.log(`gate failed: ${failed.command}. Rolling back.`);
      restoreBackup(root, backup);
      saveManifest(root, before);
      const recheck = runGates(root);
      const stillFailing = recheck.find((gate) => !gate.ok);
      if (stillFailing) {
        console.log(`post rollback gate failed: ${stillFailing.command}. Backup kept at ${backup.dir}. Not retried.`);
      } else {
        console.log(`rolled back to a validated tree. Backup kept at ${backup.dir}.`);
      }
      console.log(failureReport(failed.command, failed.output, backup.dir));
      return 1;
    }
    console.log(`updated to ${releaseManifest}. Backup kept at ${backup.dir}.`);
    return 0;
  } finally {
    cleanup();
  }
}

function printPreview(entries: ChangeEntry[]): void {
  for (const label of ["major", "minor", "patch"]) {
    const group = entries.filter((entry) => entry.label === label);
    if (group.length === 0) continue;
    console.log(`${label} (${group.length}):`);
    for (const entry of group) console.log(`  [${entry.conflict}] ${entry.path}`);
  }
}

function removedPaths(entries: ChangeEntry[]): string[] {
  return entries.filter((entry) => entry.conflict === "removed").map((entry) => entry.path);
}

async function resolveConflicts(
  entries: ChangeEntry[],
  preset: Record<string, "mine" | "theirs">,
  nonInteractive: boolean,
): Promise<Record<string, "mine" | "theirs" | "hand"> | null> {
  const conflicts = entries.filter((entry) => entry.conflict === "modified");
  const choices: Record<string, "mine" | "theirs" | "hand"> = {};
  for (const entry of conflicts) {
    const pick = preset[entry.path];
    if (pick) {
      choices[entry.path] = pick;
      continue;
    }
    if (nonInteractive) return null;
    const answer = (await ask(`${entry.path} modified locally. keep [m]ine, take [t]heirs, merge by [h]and? `)).trim().toLowerCase();
    if (answer === "t" || answer === "theirs") choices[entry.path] = "theirs";
    else if (answer === "h" || answer === "hand") choices[entry.path] = "hand";
    else choices[entry.path] = "mine";
  }
  if (!nonInteractive) {
    const confirm = (await ask(`Apply ${entries.length} changes? [y/N] `)).trim().toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      console.log("aborted by engineer. Nothing written.");
      process.exit(0);
    }
  }
  return choices;
}

function applyEntries(
  root: string,
  releaseRoot: string,
  entries: ChangeEntry[],
  choices: Record<string, "mine" | "theirs" | "hand">,
): void {
  for (const entry of entries) {
    const pick = choices[entry.path];
    if (entry.conflict === "modified" && pick !== "theirs") continue;
    if (entry.conflict === "removed") {
      const target = join(root, entry.path);
      if (existsSync(target)) rmSync(target);
      continue;
    }
    const source = join(releaseRoot, entry.path);
    const target = join(root, entry.path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}

function readReleaseVersion(releaseRoot: string): string {
  try {
    const manifest = JSON.parse(readFileSync(join(releaseRoot, "starter.json"), "utf8")) as { kitVersion?: string };
    if (manifest.kitVersion) return manifest.kitVersion;
  } catch {
    // Fall through to failure below.
  }
  throw new Error("[starter] Release has no starter.json with a kitVersion.");
}

function refreshManifest(
  root: string,
  manifest: StarterManifest,
  written: ChangeEntry[],
  entries: ChangeEntry[],
  target: string,
  migrated: string[],
): void {
  const touched = new Set(written.map((entry) => entry.path));
  for (const entry of entries) {
    if (entry.conflict === "removed") delete manifest.fingerprints[entry.path];
  }
  for (const path of touched) {
    const hash = fingerprintFile(root, path);
    if (hash) manifest.fingerprints[path] = hash;
  }
  manifest.kitVersion = target;
  const stamp = new Date().toISOString();
  for (const version of migrated) {
    if (!manifest.migrations.some((entry) => entry.version === version)) {
      manifest.migrations.push({ version, at: stamp });
    }
  }
}

function failureReport(command: string, output: string, backupDir: string): string {
  return [
    "update failed.",
    `failing step: ${command}`,
    `output tail: ${output.slice(-500)}`,
    `backup: ${backupDir}`,
    "resume: fix the cause, then rerun the same update command.",
  ].join("\n");
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
