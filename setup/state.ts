import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { WizardStateFile } from "./types.ts";

export const STATE_FILENAME = ".setup-state.json";
export const STATE_VERSION = 1;

/** sha256 of file content, for generated file tracking. */
export function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function statePath(targetDir: string): string {
  return join(targetDir, STATE_FILENAME);
}

export function loadState(targetDir: string): WizardStateFile | null {
  const path = statePath(targetDir);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as WizardStateFile;
    if (parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(targetDir: string, state: WizardStateFile): void {
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(statePath(targetDir), `${JSON.stringify(state, null, 2)}\n`);
}

export function emptyState(): WizardStateFile {
  return { version: STATE_VERSION, completedSteps: [], values: {}, fileHashes: {} };
}

/**
 * Strip secret values before persistence. A field is secret when the step's
 * UI descriptor marks it secret. Secrets travel runtime only: CLI prompt or
 * env straight into generated files, never into `.setup-state.json`.
 */
export function stripSecrets(
  values: Record<string, unknown>,
  secretFields: string[],
): Record<string, unknown> {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!secretFields.includes(key)) kept[key] = value;
  }
  return kept;
}
