/**
 * npm run starter:init — stamp starter.json for this tree. Fingerprints every
 * non Application, non secret file. Rerun after intentional Core changes.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { emptyManifest, fingerprintFile, saveManifest } from "./starter/manifest";
import { listFiles } from "./starter/update";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version?: string };
const manifest = emptyManifest(pkg.version ?? "0.0.0");
const isApp = (path: string) => manifest.applicationPaths.some((base) => path === base || path.startsWith(base));
for (const path of listFiles(root)) {
  if (isApp(path)) continue;
  const hash = fingerprintFile(root, path);
  if (hash) manifest.fingerprints[path] = hash;
}
saveManifest(root, manifest);
console.log(`starter ${manifest.kitVersion}: fingerprinted ${Object.keys(manifest.fingerprints).length} files.`);
