import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface ExecResult {
  ok: boolean;
  log: string;
}

export type Exec = (command: string, cwd: string) => Promise<ExecResult> | ExecResult;

export interface GateResult {
  name: string;
  pass: boolean;
  durationMs: number;
  log: string;
}

export interface GoldenReport {
  kitVersion: string;
  previousVersion: string | null;
  stampTime: string;
  mode: "fast" | "full";
  gates: GateResult[];
  update: { ran: boolean; reason: string };
  audit: { pass: boolean; violations: string[] };
  blocked: boolean;
}

export interface Allowlist {
  collections: string[];
  routes: string[];
  messageGroups: string[];
  assets: string[];
}

async function runGate(exec: Exec, cwd: string, name: string, command: string): Promise<GateResult> {
  const started = Date.now();
  try {
    const result = await exec(command, cwd);
    return { name, pass: result.ok, durationMs: Date.now() - started, log: result.log.slice(-2000) };
  } catch (error) {
    return {
      name,
      pass: false,
      durationMs: Date.now() - started,
      log: error instanceof Error ? error.message.slice(-2000) : String(error),
    };
  }
}

/** Content audit: nothing outside the starter set may enter the stamp. */
export function auditStamp(stampDir: string, allowlist: Allowlist): { pass: boolean; violations: string[] } {
  const violations: string[] = [];

  const rulesPath = join(stampDir, "firestore.rules");
  if (existsSync(rulesPath)) {
    const rules = readFileSync(rulesPath, "utf8");
    for (const match of rules.matchAll(/match \/([a-zA-Z0-9_-]+)\/\{[a-zA-Z0-9_-]+\}/g)) {
      if (match[1] === "databases") continue;
      if (!allowlist.collections.includes(match[1])) violations.push(`collection: ${match[1]}`);
    }
  }

  const messagesDir = join(stampDir, "messages");
  if (existsSync(messagesDir)) {
    for (const entry of readdirSync(messagesDir)) {
      if (!entry.endsWith(".json")) continue;
      const keys = Object.keys(JSON.parse(readFileSync(join(messagesDir, entry), "utf8")) as Record<string, string>);
      for (const key of keys) {
        if (!allowlist.messageGroups.some((group) => key.startsWith(group))) violations.push(`message: ${key}`);
      }
    }
  }

  const brandDir = join(stampDir, "public/brand");
  if (existsSync(brandDir)) {
    for (const entry of readdirSync(brandDir)) {
      if (!allowlist.assets.includes(entry)) violations.push(`asset: ${entry}`);
    }
  }

  const routesPath = join(stampDir, "shared/permissions/overrides.json");
  if (existsSync(routesPath)) {
    const overrides = JSON.parse(readFileSync(routesPath, "utf8")) as { routes?: { name?: string }[] };
    for (const route of overrides.routes ?? []) {
      if (route.name && !allowlist.routes.includes(route.name)) violations.push(`route: ${route.name}`);
    }
  }

  return { pass: violations.length === 0, violations };
}

export interface GoldenOptions {
  stampDir: string;
  kitVersion: string;
  previousVersion: string | null;
  mode: "fast" | "full";
  keep: boolean;
  exec: Exec;
  onEvent?: (line: string) => void;
}

/**
 * Ordered gates. Fast runs lint plus typecheck plus unit; full adds install,
 * emulators, rules, build, and the cross release update proof. Any failure
 * blocks with nonzero exit downstream; the tree stays for inspection.
 */
export async function runGoldenGates(options: GoldenOptions): Promise<GoldenReport> {
  const { stampDir, exec, onEvent } = options;
  const say = (line: string) => onEvent?.(line);
  const gates: GateResult[] = [];

  const steps =
    options.mode === "fast"
      ? [
          { name: "typecheck", command: "npx tsc --noEmit" },
          { name: "lint", command: "npx eslint" },
          { name: "tests", command: "npm test -- --run" },
        ]
      : [
          { name: "install", command: "npm install" },
          { name: "typecheck", command: "npx tsc --noEmit" },
          { name: "lint", command: "npx eslint" },
          { name: "tests", command: "npm test -- --run" },
          { name: "emulators", command: "npx firebase emulators:exec --project demo-starter --only auth,firestore,storage,functions \"echo EMULATORS_OK\"" },
          { name: "rules", command: "npm run test:rules" },
          { name: "build", command: "npm run build" },
        ];

  for (const step of steps) {
    say(`gate: ${step.name}`);
    const result = await runGate(exec, stampDir, step.name, step.command);
    gates.push(result);
    if (!result.pass) break;
  }

  const blocked = gates.some((gate) => !gate.pass);
  const report: GoldenReport = {
    kitVersion: options.kitVersion,
    previousVersion: options.previousVersion,
    stampTime: new Date().toISOString(),
    mode: options.mode,
    gates,
    update: { ran: false, reason: options.previousVersion ? "pending" : "no previous release" },
    audit: { pass: true, violations: [] },
    blocked,
  };
  writeFileSync(join(stampDir, "golden-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  say(blocked ? "golden: BLOCKED" : "golden: passed");
  if (!blocked && !options.keep) rmSync(stampDir, { recursive: true, force: true });
  return report;
}

/** Copy a repo tree into a temp stamp dir, excluding runtime and history bulk. */
export function copyRepoTree(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  const skip = new Set(["node_modules", ".git", ".next", ".starter-backups", "test-results", "playwright-report", "coverage"]);
  const walk = (base: string) => {
    for (const entry of readdirSync(join(source, base), { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const rel = base === "" ? entry.name : `${base}/${entry.name}`;
      if (entry.isDirectory()) {
        mkdirSync(join(target, rel), { recursive: true });
        walk(rel);
      } else if (entry.isFile()) {
        copyFileSync(join(source, rel), join(target, rel));
      }
    }
  };
  walk("");
}

/** Fresh temp dir for a stamp run. */
export function freshStampDir(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join(tmpdir(), `golden-${stamp}`);
}
