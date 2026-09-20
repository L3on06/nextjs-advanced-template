import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFirestoreRules,
  buildPermissionsDoc,
  buildStorageRules,
} from "@/shared/permissions/generate";

const ROOT = join(__dirname, "..", "..");

describe("generator determinism", () => {
  it("produces byte identical output on repeat runs", () => {
    expect(buildFirestoreRules()).toBe(buildFirestoreRules());
    expect(buildStorageRules()).toBe(buildStorageRules());
    expect(buildPermissionsDoc()).toBe(buildPermissionsDoc());
  });

  it("keeps committed outputs in sync with the config", () => {
    expect(readFileSync(join(ROOT, "firestore.rules"), "utf8")).toBe(buildFirestoreRules());
    expect(readFileSync(join(ROOT, "storage.rules"), "utf8")).toBe(buildStorageRules());
    expect(readFileSync(join(ROOT, "docs", "PERMISSIONS.md"), "utf8")).toBe(buildPermissionsDoc());
  });

  it("stays deny by default", () => {
    expect(buildFirestoreRules()).toContain("match /{document=**}");
    expect(buildFirestoreRules()).toContain("allow read, write: if false;");
    expect(buildStorageRules()).toContain("match /{allPaths=**}");
    expect(buildStorageRules()).toContain("allow read, write: if false;");
    expect(buildFirestoreRules()).not.toContain("if true;");
    expect(buildStorageRules()).not.toContain("if true;");
  });
});
