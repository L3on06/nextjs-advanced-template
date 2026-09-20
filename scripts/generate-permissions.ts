/**
 * Regenerate authorization outputs from the single source of truth:
 *   npm run permissions:build
 * Writes firestore.rules, storage.rules, and docs/PERMISSIONS.md.
 * Output is deterministic: same config, byte identical files.
 */
import { writeGenerated } from "../shared/permissions/generate";

writeGenerated();
console.log("permissions: generated firestore.rules, storage.rules, docs/PERMISSIONS.md");
