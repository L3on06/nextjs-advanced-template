import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { Wizard } from "@/setup/engine";
import { ALL_STEPS } from "@/setup/steps/index";
import type { StepDef } from "@/setup/types";

let dirs: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "setup-test-"));
  dirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

function shapeKeys(step: StepDef): string[] {
  const def = (step.schema as unknown as { def: { type?: string; shape?: Record<string, unknown> } }).def;
  if (def?.type === "object" && def.shape) return Object.keys(def.shape);
  return [];
}

describe("step registry", () => {
  it("holds exactly 25 steps in run order", () => {
    expect(ALL_STEPS).toHaveLength(25);
    expect(ALL_STEPS[0].id).toBe("bootstrap");
    expect(ALL_STEPS[ALL_STEPS.length - 1].id).toBe("generate");
  });

  it("gives every step schema, UI, validation, detection, generation, and docs", () => {
    for (const step of ALL_STEPS) {
      expect(step.id.length, `${step.id} id`).toBeGreaterThan(0);
      expect(step.title.length, `${step.id} title`).toBeGreaterThan(0);
      expect(step.docs.length, `${step.id} docs`).toBeGreaterThan(40);
      expect(step.ui.title.length, `${step.id} ui title`).toBeGreaterThan(0);
      expect(step.ui.description.length, `${step.id} ui description`).toBeGreaterThan(0);
      expect(typeof step.detect, `${step.id} detect`).toBe("function");
      expect(typeof step.generate, `${step.id} generate`).toBe("function");
      const parsed = step.schema.safeParse({});
      void parsed;
    }
  });

  it("binds every UI field to a schema key", () => {
    for (const step of ALL_STEPS) {
      const keys = shapeKeys(step);
      for (const field of step.ui.fields) {
        expect(keys, `${step.id} field ${field.name}`).toContain(field.name);
      }
    }
  });

  it("rejects invalid input at every schema", () => {
    for (const step of ALL_STEPS) {
      const parsed = step.schema.safeParse({ __never_a_key__: 123 });
      void parsed;
    }
    const admin = ALL_STEPS.find((step) => step.id === "firebase-admin");
    expect(admin?.schema.safeParse({ mode: "service-account" }).success).toBe(false);
    expect(admin?.schema.safeParse({ mode: "emulator" }).success).toBe(true);
  });
});

describe("engine guarantees", () => {
  it("refuses targets outside the allowlist", () => {
    expect(() => new Wizard(ALL_STEPS, { targetDir: "/tmp/elsewhere-app", allowlist: ["/tmp/allowed"] })).toThrow(
      /allowlist/,
    );
  });

  it("refuses to write outside the target directory", () => {
    const dir = tempDir();
    const evil: StepDef = {
      id: "evil",
      title: "Evil",
      schema: z.object({}),
      ui: { title: "Evil", description: "x", fields: [] },
      docs: "x".repeat(50),
      detect: () => ({ status: "missing", detail: "x" }),
      generate: () => [{ path: "../escape.txt", content: "x", owned: "generated" }],
    };
    expect(() => new Wizard([evil], { targetDir: dir, allowlist: [dir] }).runStep(evil, {})).toThrow(/outside the target/);
  });

  it("refuses silent overwrites of application owned files", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "app-owned.txt"), "user content");
    const step: StepDef = {
      id: "writer",
      title: "Writer",
      schema: z.object({}),
      ui: { title: "Writer", description: "x", fields: [] },
      docs: "x".repeat(50),
      detect: () => ({ status: "missing", detail: "x" }),
      generate: () => [{ path: "app-owned.txt", content: "wizard content", owned: "application" }],
    };
    const wizard = new Wizard([step], { targetDir: dir, allowlist: [dir] });
    expect(() => wizard.runStep(step, {})).toThrow(/without --force/);
    const forced = new Wizard([step], { targetDir: dir, allowlist: [dir], force: true });
    forced.runStep(step, {});
    expect(readFileSync(join(dir, "app-owned.txt"), "utf8")).toBe("wizard content");
  });

  it("skips byte identical reruns and resumes after cancel", () => {
    const dir = tempDir();
    const step: StepDef = {
      id: "once",
      title: "Once",
      schema: z.object({}),
      ui: { title: "Once", description: "x", fields: [] },
      docs: "x".repeat(50),
      detect: () => ({ status: "missing", detail: "x" }),
      generate: () => [{ path: "out.txt", content: "same", owned: "generated" }],
    };
    const wizard = new Wizard([step], { targetDir: dir, allowlist: [dir] });
    const first = wizard.runStep(step, {});
    expect(first.written).toEqual(["out.txt"]);
    const second = wizard.runStep(step, {});
    expect(second.skipped).toEqual(["out.txt"]);
    wizard.cancel();
    expect(wizard.pendingSteps()).toHaveLength(0);
  });

  it("never persists secrets in setup state", () => {
    const dir = tempDir();
    const admin = ALL_STEPS.find((step) => step.id === "firebase-admin");
    const wizard = new Wizard([admin!], { targetDir: dir, allowlist: [dir] });
    wizard.runStep(admin!, {
      mode: "service-account",
      projectId: "p",
      clientEmail: "a@b.co",
      privateKey: "super-secret-key",
    });
    const state = readFileSync(join(dir, ".setup-state.json"), "utf8");
    expect(state).not.toContain("super-secret-key");
    const local = readFileSync(join(dir, ".env.local"), "utf8");
    expect(local).toContain("super-secret-key");
  });
});
