import type { z } from "zod";

/**
 * Setup wizard core types. Every one of the 25 steps implements StepDef:
 * schema, UI descriptor, validation, detection, generation, and docs.
 * Tests enforce this shape so no step ships half defined.
 */

export type StepStatus = "current" | "stale" | "missing";

export interface Detection {
  status: StepStatus;
  detail: string;
}

export type UiFieldType = "text" | "secret" | "select" | "multiselect" | "boolean" | "number";

export interface UiField {
  name: string;
  label: string;
  type: UiFieldType;
  help?: string;
  options?: string[];
  secret?: boolean;
}

export interface StepUI {
  title: string;
  description: string;
  fields: UiField[];
}

/** A file the wizard wants to write. */
export interface GeneratedFile {
  /** Repo relative path, e.g. "firebase.json". */
  path: string;
  content: string;
  /** Who owns the file after generation. Application files are never overwritten silently. */
  owned: "generated" | "application";
}

export interface StepContext {
  /** Absolute allowlisted target directory. All writes stay inside it. */
  targetDir: string;
  /** Validated runtime values for this step. Secrets live here only, never in state. */
  values: Record<string, unknown>;
  /** Non secret values of already completed steps, for steps that build on prior input. */
  prior: Record<string, Record<string, unknown>>;
  /** sha256 of every file the wizard wrote so far, for manifests. */
  hashes: Record<string, string>;
  /** Force overwrite of application owned files the wizard did not create. */
  force: boolean;
}

export interface StepDef {
  id: string;
  title: string;
  /** Zod schema validating runtime input. Secret fields are stripped before state save. */
  schema: z.ZodType;
  /** Declarative UI rendered by setup/ui.tsx. Field names must match schema keys. */
  ui: StepUI;
  /** Human documentation for the step. Required, non empty. */
  docs: string;
  /** Inspect the target dir: is this step's output present and valid? */
  detect: (targetDir: string, values: Record<string, unknown>, state: WizardStateFile | null) => Detection;
  /** Produce the step's files. Pure except for reading the target dir. */
  generate: (ctx: StepContext) => GeneratedFile[];
}

export interface WizardStateFile {
  version: 1;
  /** Steps completed with valid output. Resume continues after the last one. */
  completedSteps: string[];
  /** Non secret validated values per step, for rerun detection and review. */
  values: Record<string, Record<string, unknown>>;
  /** sha256 of every file the wizard wrote, for overwrite and staleness checks. */
  fileHashes: Record<string, string>;
  cancelledAt?: string;
}
