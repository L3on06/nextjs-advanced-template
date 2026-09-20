import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Wizard } from "@/setup/engine";
import { ALL_STEPS } from "@/setup/steps/index";

let dirs: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "setup-roundtrip-"));
  dirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

const INPUTS: Record<string, Record<string, unknown>> = {
  bootstrap: { appName: "Roundtrip App" },
  "firebase-project": { projectId: "roundtrip-app" },
  "firebase-admin": { mode: "emulator" },
  "app-metadata": { appName: "Roundtrip App", tagline: "Prove the wizard", defaultLocale: "en" },
  design: { primaryColor: "#1d4ed8" },
  branding: { brandName: "Roundtrip", brandColor: "#1d4ed8" },
  generate: { confirm: true },
};

describe("full wizard round trip", () => {
  it("stamps a complete app, reruns idempotently, and resumes", () => {
    const dir = tempDir();
    const wizard = new Wizard(ALL_STEPS, { targetDir: dir, allowlist: [dir], inputs: INPUTS });
    const results = wizard.runAll();
    expect(results).toHaveLength(25);

    const read = (rel: string) => readFileSync(join(dir, rel), "utf8");
    expect(JSON.parse(read("firebase.json")).emulators.auth.port).toBe(9099);
    expect(read("firestore.rules")).toContain("match /users/{userId}");
    expect(read("firestore.rules")).toContain("match /{document=**}");
    expect(read("storage.rules")).toContain("match /{allPaths=**}");
    expect(JSON.parse(read("messages/en.json"))["app.name"]).toBe("Roundtrip App");
    expect(JSON.parse(read("shared/permissions/overrides.json")).roles).toContain("admin");
    expect(read("docs/PERMISSIONS.md")).toContain("users:manage");
    expect(existsSync(join(dir, "public/brand/logo.svg"))).toBe(true);
    expect(existsSync(join(dir, ".setup-complete.json"))).toBe(true);
    expect(existsSync(join(dir, ".env.local"))).toBe(false);

    const state = read(".setup-state.json");
    expect(state).not.toContain("privateKey");

    const rerun = new Wizard(ALL_STEPS, { targetDir: dir, allowlist: [dir], inputs: INPUTS });
    expect(rerun.pendingSteps()).toHaveLength(0);
    const second = rerun.runAll();
    expect(second).toHaveLength(0);
  });

  it("detects existing valid configuration and preserves it", () => {
    const dir = tempDir();
    const first = new Wizard(ALL_STEPS, { targetDir: dir, allowlist: [dir], inputs: INPUTS });
    first.runAll();
    const rulesBefore = readFileSync(join(dir, "firestore.rules"), "utf8");
    const second = new Wizard(ALL_STEPS, { targetDir: dir, allowlist: [dir], inputs: INPUTS });
    const results = second.runStep(ALL_STEPS.find((step) => step.id === "bootstrap")!, INPUTS["bootstrap"]);
    expect(results.status).toBe("current");
    expect(readFileSync(join(dir, "firestore.rules"), "utf8")).toBe(rulesBefore);
  });
});
