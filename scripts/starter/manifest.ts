import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const MANIFEST_PATH = "starter.json";
export const MANIFEST_VERSION = 1;

/** Path fragments never fingerprinted, backed up, previewed, or logged. */
export const SECRET_FRAGMENTS = [".env.local", ".env.", "service-account", "-key.json", ".pem"];

export interface StarterManifest {
  version: 1;
  kitVersion: string;
  schemaVersion: number;
  fingerprints: Record<string, string>;
  applicationPaths: string[];
  migrations: { version: string; at: string }[];
}

export function isSecretPath(path: string): boolean {
  return SECRET_FRAGMENTS.some((entry) => path.includes(entry));
}

export function isBackupPath(path: string): boolean {
  return path.startsWith(".starter-backups/");
}

/**
 * sha256 over line ending normalized bytes. Symlinks are never followed and
 * read errors fail closed with null, so the caller treats them as changes.
 */
export function fingerprintFile(root: string, relPath: string): string | null {
  const absolute = join(root, relPath);
  try {
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;
    const raw = readFileSync(absolute, "utf8");
    return createHash("sha256").update(raw.replace(/\r\n/g, "\n"), "utf8").digest("hex");
  } catch {
    return null;
  }
}

export function loadManifest(root: string): StarterManifest {
  const absolute = join(root, MANIFEST_PATH);
  if (!existsSync(absolute)) {
    throw new Error(`[starter] No ${MANIFEST_PATH} found. Run the scaffold or init step first.`);
  }
  try {
    const parsed = JSON.parse(readFileSync(absolute, "utf8")) as StarterManifest;
    if (parsed.version !== MANIFEST_VERSION) {
      throw new Error(`[starter] Unsupported manifest schema. Expected ${MANIFEST_VERSION}.`);
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[starter]")) throw error;
    throw new Error(`[starter] Manifest unreadable: ${MANIFEST_PATH}`);
  }
}

export function saveManifest(root: string, manifest: StarterManifest): void {
  writeFileSync(join(root, MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`);
}

export function emptyManifest(kitVersion: string): StarterManifest {
  return {
    version: MANIFEST_VERSION,
    kitVersion,
    schemaVersion: 1,
    fingerprints: {},
    applicationPaths: ["app/", "features/", "functions/src/"],
    migrations: [],
  };
}
