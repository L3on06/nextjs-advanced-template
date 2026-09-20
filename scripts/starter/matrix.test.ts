import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { classifyChange } from "@/scripts/starter/classify";
import { emptyManifest, fingerprintFile, isSecretPath, saveManifest } from "@/scripts/starter/manifest";
import { applicableMigrations, runMigrations, type Migration } from "@/scripts/starter/migrate";
import { createBackup, inspect, restoreBackup } from "@/scripts/starter/update";

let dirs: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "starter-test-"));
  dirs.push(dir);
  return dir;
}
function write(root: string, rel: string, content: string): void {
  mkdirSync(join(root, dirname(rel)), { recursive: true });
  writeFileSync(join(root, rel), content);
}
afterEach(() => {  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

function appTree(): string {
  const dir = tempDir();
  write(dir, "starter.json", JSON.stringify({ version: 1, kitVersion: "1.0.0", schemaVersion: 1, fingerprints: {}, applicationPaths: ["app/"], migrations: [] }));
  write(dir, "shared/core.ts", "core v1");
  write(dir, "app/page.tsx", "my page");
  write(dir, ".env.local", "SECRET=shh");
  return dir;
}

function releaseTree(files: Record<string, string>): string {
  const dir = tempDir();
  for (const [path, content] of Object.entries(files)) write(dir, path, content);
  return dir;
}

describe("classify", () => {
  it("labels contracts major, additions minor, docs patch", () => {
    expect(classifyChange("docs/CORE-CONTRACT.md", false).label).toBe("major");
    expect(classifyChange("setup/steps/new.ts", false).label).toBe("minor");
    expect(classifyChange("docs/notes.md", false).label).toBe("patch");
  });
});

describe("fingerprints and secrets", () => {
  it("normalizes line endings and skips symlinks and secrets", () => {
    const dir = tempDir();
    write(dir, "a.txt", "x\r\ny");
    write(dir, "b.txt", "x\ny");
    expect(fingerprintFile(dir, "a.txt")).toBe(fingerprintFile(dir, "b.txt"));
    expect(fingerprintFile(dir, "missing.txt")).toBeNull();
    expect(isSecretPath(".env.local")).toBe(true);
    expect(isSecretPath("service-account.json")).toBe(true);
    expect(isSecretPath("shared/core.ts")).toBe(false);
  });
});

describe("inspect", () => {
  it("reports clean on identical trees", () => {
    const app = appTree();
    const manifest = { ...emptyManifest("1.0.0"), applicationPaths: ["app/"] };
    manifest.fingerprints["shared/core.ts"] = fingerprintFile(app, "shared/core.ts")!;
    saveManifest(app, manifest);
    const release = releaseTree({ "shared/core.ts": "core v1" });
    expect(inspect(app, { root: release, version: "1.0.0", migrations: [] })).toEqual([]);
  });

  it("never lists application files and flags local edits as modified", () => {
    const app = appTree();
    const manifest = { ...emptyManifest("1.0.0"), applicationPaths: ["app/"] };
    manifest.fingerprints["shared/core.ts"] = "stale-hash";
    saveManifest(app, manifest);
    const release = releaseTree({ "shared/core.ts": "core v2", "app/page.tsx": "changed upstream" });
    const entries = inspect(app, { root: release, version: "2.0.0", migrations: [] });
    expect(entries.map((entry) => entry.path)).not.toContain("app/page.tsx");
    expect(entries.find((entry) => entry.path === "shared/core.ts")?.conflict).toBe("modified");
  });
});

describe("backup and rollback", () => {
  it("backs up overwritten files only, excluding secrets, and restores byte identical", () => {
    const app = appTree();
    const backup = createBackup(app, ["shared/core.ts", ".env.local", "missing.txt"]);
    expect(backup.files).toEqual(["shared/core.ts"]);
    write(app, "shared/core.ts", "clobbered");
    restoreBackup(app, backup);
    expect(readFileSync(join(app, "shared/core.ts"), "utf8")).toBe("core v1");
    expect(readFileSync(join(app, ".env.local"), "utf8")).toBe("SECRET=shh");
  });
});

describe("migrations", () => {
  const edits: string[] = [];
  const all: Migration[] = [
    { version: "1.2.0", from: "1.0.0", to: "1.2.0", describe: "b", migrate: (root) => { edits.push("1.2.0"); return []; } },
    { version: "1.1.0", from: "1.0.0", to: "1.1.0", describe: "a", migrate: (root) => { edits.push("1.1.0"); return []; } },
    { version: "2.0.0", from: "1.2.0", to: "2.0.0", describe: "c", migrate: (root) => { edits.push("2.0.0"); return []; } },
  ];
  it("runs in semver order within range", () => {
    const dir = tempDir();
    const reports = runMigrations(dir, applicableMigrations("1.0.0", "1.2.0", all));
    expect(reports.map((report) => report.version)).toEqual(["1.1.0", "1.2.0"]);
    expect(edits).toEqual(["1.1.0", "1.2.0"]);
  });

  it("recovers from a failed migration via backup restore", () => {
    const dir = tempDir();
    write(dir, "shared/core.ts", "good");
    const backup = createBackup(dir, ["shared/core.ts"]);
    const bad: Migration = {
      version: "9.9.9", from: "0.0.0", to: "9.9.9", describe: "boom",
      migrate: (root) => {
        write(root, "shared/core.ts", "half applied");
        throw new Error("migration exploded");
      },
    };
    expect(() => runMigrations(dir, [bad])).toThrow("migration exploded");
    restoreBackup(dir, backup);
    expect(readFileSync(join(dir, "shared/core.ts"), "utf8")).toBe("good");
  });
});

describe("generated configuration change", () => {
  it("detects a changed generated file as updatable", () => {
    const app = appTree();
    write(app, "firestore.rules", "rules v1");
    const manifest = { ...emptyManifest("1.0.0"), applicationPaths: ["app/"] };
    manifest.fingerprints["firestore.rules"] = fingerprintFile(app, "firestore.rules")!;
    saveManifest(app, manifest);
    const release = releaseTree({ "firestore.rules": "rules v2" });
    const entries = inspect(app, { root: release, version: "1.1.0", migrations: [] });
    expect(entries).toHaveLength(1);
    expect(entries[0].conflict).toBe("clean");
  });
});
