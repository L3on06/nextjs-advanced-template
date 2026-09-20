/**
 * npm run starter:check -- --release <dir|git-ref> [--json]
 * Read only: grouped pending changes, zero writes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { loadManifest } from "./starter/manifest";
import { inspect, type Release } from "./starter/update";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

/** Local dir wins; otherwise a git ref is archived to a temp dir. Offline with no local dir fails closed. */
export function resolveRelease(root: string, ref: string): { release: Release; cleanup: () => void } {
  const local = isAbsolute(ref) ? ref : join(root, ref);
  if (existsSync(local) && statSync(local).isDirectory()) {
    return { release: { root: local, version: ref, migrations: [] }, cleanup: () => {} };
  }
  const temp = mkdtempSync(join(tmpdir(), "starter-release-"));
  if (!/^[A-Za-z0-9._/-]+$/.test(ref)) {
    rmSync(temp, { recursive: true, force: true });
    throw new Error(`[starter] Unsafe release ref: '${ref}'.`);
  }
  try {
    execFileSync(`git archive ${ref} --format=tar --prefix=release/ | tar -xf - -C ${temp}`, {
      cwd: root,
      shell: "/bin/sh",
    });
  } catch {
    rmSync(temp, { recursive: true, force: true });
    throw new Error(`[starter] Offline fail closed: release '${ref}' is not a local directory and git fetch failed.`);
  }
  return {
    release: { root: join(temp, "release"), version: ref, migrations: [] },
    cleanup: () => rmSync(temp, { recursive: true, force: true }),
  };
}

const root = process.cwd();
const ref = flag("--release");
if (!ref) throw new Error("[starter] Missing --release <dir|git-ref>.");
const manifest = loadManifest(root);
const { release, cleanup } = resolveRelease(root, ref);
try {
  const entries = inspect(root, release);
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ kitVersion: manifest.kitVersion, entries }, null, 2));
  } else if (entries.length === 0) {
    console.log(`starter ${manifest.kitVersion}: clean, no pending changes.`);
  } else {
    for (const label of ["major", "minor", "patch"]) {
      const group = entries.filter((entry) => entry.label === label);
      if (group.length === 0) continue;
      console.log(`${label} (${group.length}):`);
      for (const entry of group) console.log(`  [${entry.conflict}] ${entry.path}`);
    }
  }
} finally {
  cleanup();
}
