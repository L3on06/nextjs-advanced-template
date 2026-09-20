import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GeneratedFile } from "../types";

/** Read and parse a JSON file under the target dir, or null when absent. */
export function readJsonFile(targetDir: string, relPath: string): unknown {
  const absolute = join(targetDir, relPath);
  if (!existsSync(absolute)) return null;
  try {
    return JSON.parse(readFileSync(absolute, "utf8")) as unknown;
  } catch {
    return null;
  }
}

/** True when the file exists with exactly this content. */
export function fileMatches(targetDir: string, relPath: string, content: string): boolean {
  const absolute = join(targetDir, relPath);
  if (!existsSync(absolute)) return false;
  return readFileSync(absolute, "utf8") === content;
}

/** Merge one section into firebase.json, preserving every other section. */
export function firebaseJsonMerge(targetDir: string, section: string, value: unknown): GeneratedFile {
  const current = (readJsonFile(targetDir, "firebase.json") ?? {}) as Record<string, unknown>;
  const next = { ...current, [section]: value };
  return {
    path: "firebase.json",
    content: `${JSON.stringify(next, null, 2)}\n`,
    owned: "generated",
  };
}

/** Deep-ish merge one section into shared/permissions/overrides.json. */
export function overridesMerge(targetDir: string, section: string, value: unknown): GeneratedFile {
  const current = (readJsonFile(targetDir, "shared/permissions/overrides.json") ?? {}) as Record<
    string,
    unknown
  >;
  const next = { ...current, [section]: value };
  return {
    path: "shared/permissions/overrides.json",
    content: `${JSON.stringify(next, null, 2)}\n`,
    owned: "generated",
  };
}

/** Merge message keys into messages/<locale>.json, preserving existing copy. */
export function messagesMerge(
  targetDir: string,
  locale: string,
  keys: Record<string, string>,
): GeneratedFile {
  const current = (readJsonFile(targetDir, `messages/${locale}.json`) ?? {}) as Record<string, string>;
  return {
    path: `messages/${locale}.json`,
    content: `${JSON.stringify({ ...keys, ...current }, null, 2)}\n`,
    owned: "generated",
  };
}

/** Append a managed block to .gitignore when missing. Idempotent. */
export function gitignoreMerge(targetDir: string, block: string): GeneratedFile {
  const absolute = join(targetDir, ".gitignore");
  const current = existsSync(absolute) ? readFileSync(absolute, "utf8") : "";
  if (current.includes(block.trim())) {
    return { path: ".gitignore", content: current, owned: "generated" };
  }
  const separator = current === "" || current.endsWith("\n") ? "" : "\n";
  return { path: ".gitignore", content: `${current}${separator}\n${block}\n`, owned: "generated" };
}
