import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { emptyState, hashContent, loadState, saveState, stripSecrets } from "./state";
import type { GeneratedFile, StepContext, StepDef, StepStatus } from "./types.ts";

export interface WizardOptions {
  /** Absolute target directory. Must sit inside the allowlist. */
  targetDir: string;
  /** Absolute directories writing is permitted under. Defaults to cwd. */
  allowlist?: string[];
  /** Overwrite application owned files the wizard did not create. */
  force?: boolean;
  /** Runtime values per step id. Secrets stay here, never in state. */
  inputs?: Record<string, Record<string, unknown>>;
}

export interface StepResult {
  id: string;
  status: StepStatus;
  written: string[];
  skipped: string[];
}

function fileHashOnDisk(path: string): string | null {
  if (!existsSync(path)) return null;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Reject any path escaping the target directory. */
function resolveInside(targetDir: string, relPath: string): string {
  const absolute = resolve(targetDir, relPath);
  const rel = relative(targetDir, absolute);
  if (rel === "" || rel.startsWith("..")) {
    throw new Error(`[setup] Refusing to write outside the target directory: ${relPath}`);
  }
  return absolute;
}

export class Wizard {
  private steps: StepDef[];
  private targetDir: string;
  private force: boolean;
  private inputs: Record<string, Record<string, unknown>>;
  private cancelled = false;

  constructor(steps: StepDef[], options: WizardOptions) {
    const targetDir = resolve(options.targetDir);
    const allowlist = (options.allowlist ?? [process.cwd()]).map((entry) => resolve(entry));
    const allowed = allowlist.some(
      (base) => targetDir === base || !relative(base, targetDir).startsWith(".."),
    );
    if (!allowed) {
      throw new Error(`[setup] Target directory is outside the allowlist: ${targetDir}`);
    }
    this.steps = steps;
    this.targetDir = targetDir;
    this.force = options.force ?? false;
    this.inputs = options.inputs ?? {};
  }

  cancel(): void {
    this.cancelled = true;
    const state = loadState(this.targetDir) ?? emptyState();
    state.cancelledAt = new Date().toISOString();
    saveState(this.targetDir, state);
  }

  /** Steps not yet completed, in order. Resume starts here. */
  pendingSteps(): StepDef[] {
    const state = loadState(this.targetDir);
    const done = new Set(state?.completedSteps ?? []);
    return this.steps.filter((step) => !done.has(step.id));
  }

  /** Run one step: validate, detect, generate idempotently, record state. */
  runStep(step: StepDef, runtimeValues: Record<string, unknown> = {}): StepResult {
    const parsed = step.schema.safeParse(runtimeValues);
    if (!parsed.success) {
      throw new Error(
        `[setup] Invalid input for step ${step.id}:\n${parsed.error.issues.map((issue) => ` - ${issue.path.join(".")}: ${issue.message}`).join("\n")}`,
      );
    }
    const values = parsed.data as Record<string, unknown>;
    const state = loadState(this.targetDir) ?? emptyState();
    const secretFields = step.ui.fields.filter((field) => field.secret).map((field) => field.name);
    const recordCompletion = () => {
      state.values[step.id] = stripSecrets(values, secretFields) as Record<string, unknown>;
      if (!state.completedSteps.includes(step.id)) state.completedSteps.push(step.id);
      delete state.cancelledAt;
      saveState(this.targetDir, state);
    };

    const detection = step.detect(this.targetDir, values, state);

    if (detection.status === "current") {
      recordCompletion();
      return { id: step.id, status: "current", written: [], skipped: [] };
    }

    const ctx: StepContext = {
      targetDir: this.targetDir,
      values,
      prior: state.values,
      hashes: state.fileHashes,
      force: this.force,
    };
    const files = step.generate(ctx);
    const written: string[] = [];
    const skipped: string[] = [];

    for (const file of files) {
      const absolute = resolveInside(this.targetDir, file.path);
      const onDisk = fileHashOnDisk(absolute);
      const tracked = state.fileHashes[file.path];
      if (onDisk !== null && onDisk === tracked && onDisk === hashContent(file.content)) {
        skipped.push(file.path);
        continue;
      }
      if (
        file.owned === "application" &&
        onDisk !== null &&
        onDisk !== tracked &&
        !this.force
      ) {
        throw new Error(
          `[setup] Refusing to overwrite application owned file without --force: ${file.path}`,
        );
      }
      mkdirSync(dirname(absolute), { recursive: true });
      writeFileSync(absolute, file.content);
      state.fileHashes[file.path] = hashContent(file.content);
      written.push(file.path);
    }

    recordCompletion();
    return { id: step.id, status: detection.status, written, skipped };
  }

  /** Run all pending steps in order. Stops early when cancelled. */
  runAll(): StepResult[] {
    const results: StepResult[] = [];
    for (const step of this.pendingSteps()) {
      if (this.cancelled) break;
      results.push(this.runStep(step, this.inputs[step.id] ?? {}));
    }
    return results;
  }
}

export type { GeneratedFile };
