import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { auditStamp, copyRepoTree, freshStampDir, runGoldenGates, type Exec } from "@/scripts/golden/run";

let dirs: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "golden-test-"));
  dirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

const ALLOW = {
  collections: ["users"],
  routes: ["home"],
  messageGroups: ["app_"],
  assets: ["logo.svg"],
};

describe("auditStamp", () => {
  it("passes a starter only stamp", () => {
    const dir = tempDir();
    mkdirSync(join(dir, "messages"), { recursive: true });
    writeFileSync(join(dir, "firestore.rules"), "match /databases/{database}/documents { match /users/{userId} {} }");
    writeFileSync(join(dir, "messages/en.json"), JSON.stringify({ app_name: "x" }));
    mkdirSync(join(dir, "public/brand"), { recursive: true });
    writeFileSync(join(dir, "public/brand/logo.svg"), "<svg/>");
    expect(auditStamp(dir, ALLOW)).toEqual({ pass: true, violations: [] });
  });

  it("fails collections, messages, assets, and routes outside the list", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "firestore.rules"), "match /orders/{id} {}");
    mkdirSync(join(dir, "messages"), { recursive: true });
    writeFileSync(join(dir, "messages/en.json"), JSON.stringify({ shop_cart: "x" }));
    mkdirSync(join(dir, "public/brand"), { recursive: true });
    writeFileSync(join(dir, "public/brand/banner.jpg"), "x");
    mkdirSync(join(dir, "shared/permissions"), { recursive: true });
    writeFileSync(join(dir, "shared/permissions/overrides.json"), JSON.stringify({ routes: [{ name: "shop" }] }));
    const result = auditStamp(dir, ALLOW);
    expect(result.pass).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining(["collection: orders", "message: shop_cart", "asset: banner.jpg", "route: shop"]),
    );
  });
});

describe("runGoldenGates", () => {
  const okExec: Exec = () => ({ ok: true, log: "ok" });

  it("runs fast gates in order and writes the report", async () => {
    const dir = tempDir();
    const events: string[] = [];
    const report = await runGoldenGates({
      stampDir: dir,
      kitVersion: "1.0.0",
      previousVersion: null,
      mode: "fast",
      keep: true,
      exec: okExec,
      onEvent: (line) => events.push(line),
    });
    expect(report.gates.map((gate) => gate.name)).toEqual(["typecheck", "lint", "tests"]);
    expect(report.blocked).toBe(false);
    expect(report.update).toEqual({ ran: false, reason: "no previous release" });
  });

  it("stops at the first failure and blocks", async () => {
    const dir = tempDir();
    const calls: string[] = [];
    const exec: Exec = (command) => {
      calls.push(command);
      return command.includes("tsc") ? { ok: false, log: "boom" } : { ok: true, log: "ok" };
    };
    const report = await runGoldenGates({
      stampDir: dir,
      kitVersion: "1.0.0",
      previousVersion: "v0.9.0",
      mode: "fast",
      keep: true,
      exec,
    });
    expect(report.blocked).toBe(true);
    expect(calls).toHaveLength(1);
    expect(report.gates[0]).toMatchObject({ name: "typecheck", pass: false });
  });

  it("cleans the stamp dir on success unless kept", async () => {
    const dir = tempDir();
    const report = await runGoldenGates({
      stampDir: dir,
      kitVersion: "1.0.0",
      previousVersion: null,
      mode: "fast",
      keep: false,
      exec: okExec,
    });
    expect(report.blocked).toBe(false);
    expect(existsSync(dir)).toBe(false);
  });
});

describe("stamp helpers", () => {
  it("creates fresh temp dirs and copies trees without bulk", () => {
    const source = tempDir();
    mkdirSync(join(source, "node_modules"), { recursive: true });
    writeFileSync(join(source, "node_modules/big.js"), "x");
    writeFileSync(join(source, "keep.txt"), "x");
    const target = freshStampDir();
    dirs.push(target);
    copyRepoTree(source, target);
    expect(existsSync(join(target, "keep.txt"))).toBe(true);
    expect(existsSync(join(target, "node_modules"))).toBe(false);
  });
});
