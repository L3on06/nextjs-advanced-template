import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { classifyChange } from "./classify";
import { fingerprintFile, isBackupPath, isSecretPath, loadManifest } from "./manifest";

export type ConflictState = "clean" | "modified" | "added" | "removed";

export interface ChangeEntry {
  path: string;
  label: "patch" | "minor" | "major";
  migration: boolean;
  conflict: ConflictState;
}

/** Release payload: the new tree to compare against, from a local dir or git ref. */
export interface Release {
  root: string;
  version: string;
  migrations: string[];
}

export function listFiles(root: string, base = ""): string[] {
  const out: string[] = [];
  let entries;
  try {
    entries = readdirSync(join(root, base), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const rel = base === "" ? entry.name : `${base}/${entry.name}`;
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
    if (isBackupPath(rel) || isSecretPath(rel)) continue;
    if (entry.isDirectory()) out.push(...listFiles(root, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

/**
 * Inspect: compare installed manifest fingerprints against the release tree.
 * A path the manifest never saw is added; a missing release file is removed;
 * a hash mismatch on a tracked path is modified. Application paths never
 * appear: the updater never writes them.
 */
export function inspect(root: string, release: Release): ChangeEntry[] {
  const manifest = loadManifest(root);
  const entries: ChangeEntry[] = [];
  const releaseFiles = new Set(listFiles(release.root));
  const tracked = new Set(Object.keys(manifest.fingerprints));
  const isApp = (path: string) => manifest.applicationPaths.some((base) => path === base || path.startsWith(base));

  for (const path of releaseFiles) {
    if (isApp(path)) continue;
    const incoming = fingerprintFile(release.root, path);
    const installed = manifest.fingerprints[path];
    const current = fingerprintFile(root, path);
    if (incoming === current) continue;
    if (installed === undefined) {
      entries.push({
        path,
        ...classifyChange(path, false),
        conflict: current === null ? "added" : "modified",
      });
      continue;
    }
    if (current !== installed) {
      entries.push({ path, ...classifyChange(path, false), conflict: "modified" });
      continue;
    }
    entries.push({ path, ...classifyChange(path, false), conflict: "clean" });
  }
  for (const path of tracked) {
    if (!releaseFiles.has(path) && !isApp(path)) {
      entries.push({ path, ...classifyChange(path, false), conflict: "removed" });
    }
  }
  entries.sort((left, right) => (left.path < right.path ? -1 : 1));
  return entries;
}

export interface Backup {
  dir: string;
  files: string[];
}

/** UTC timestamped backup of overwritten files only. Secrets never enter. */
export function createBackup(root: string, paths: string[]): Backup {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  let dir = join(root, ".starter-backups", stamp);
  let suffix = 0;
  while (existsSync(dir)) {
    suffix += 1;
    dir = join(root, ".starter-backups", `${stamp}-${suffix}`);
  }
  mkdirSync(dir, { recursive: true });
  const files: string[] = [];
  for (const path of paths) {
    if (isSecretPath(path) || isBackupPath(path)) continue;
    const absolute = join(root, path);
    if (!existsSync(absolute)) continue;
    const target = join(dir, path);
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, readFileSync(absolute));
    files.push(path);
  }
  writeFileSync(join(dir, "manifest.json"), `${JSON.stringify({ files }, null, 2)}\n`);
  return { dir, files };
}

/** Restore every file from a backup into the tree. */
export function restoreBackup(root: string, backup: Backup): void {
  for (const path of backup.files) {
    const target = join(root, path);
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, readFileSync(join(backup.dir, path)));
  }
}

export interface GateResult {
  command: string;
  ok: boolean;
  output: string;
}

const GATES = [
  "npx tsc --noEmit",
  "npx eslint",
  "npm test -- --run",
  "npm run build",
];

/** Validate: the exact gate order with a ten minute timeout each. */
export function runGates(root: string, timeoutMs = 10 * 60 * 1000): GateResult[] {
  const results: GateResult[] = [];
  for (const command of GATES) {
    try {
      const output = execFileSync(command, { cwd: root, timeout: timeoutMs, shell: "/bin/sh", encoding: "utf8" });
      results.push({ command, ok: true, output: output.slice(-2000) });
    } catch (error) {
      const output = error instanceof Error ? error.message.slice(-2000) : String(error);
      results.push({ command, ok: false, output });
      break;
    }
  }
  return results;
}
