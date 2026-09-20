/**
 * npm run golden [-- --mode fast|full] [--keep] [--previous <tag|dir>]
 * Temp stamp a reference app, run the ordered gates, prove cross release
 * update when a previous release exists, and leave a JSON report.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { auditStamp, copyRepoTree, freshStampDir, runGoldenGates, type Exec } from "./golden/run";
import { Wizard } from "../setup/engine";
import { ALL_STEPS } from "../setup/steps/index";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const realExec: Exec = (command, cwd) => {
  try {
    const log = execFileSync(command, { cwd, shell: "/bin/sh", encoding: "utf8", timeout: 10 * 60 * 1000 });
    return { ok: true, log: String(log).slice(-2000) };
  } catch (error) {
    return { ok: false, log: error instanceof Error ? error.message.slice(-2000) : String(error) };
  }
};

function latestTag(root: string): string | null {
  try {
    const out = execFileSync("git tag --list 'v*' --sort=-v:refname", { cwd: root, encoding: "utf8" });
    const first = String(out).split("\n").map((line) => line.trim()).find((line) => line !== "");
    return first ?? null;
  } catch {
    return null;
  }
}

const SURFACES: [string, string][] = [
  ["golden/surfaces/sign-in-page.tsx", "app/golden-sign-in/page.tsx"],
  ["golden/surfaces/theme-page.tsx", "app/golden-theme/page.tsx"],
  ["golden/surfaces/status-wall-page.tsx", "app/golden-statuses/page.tsx"],
];

async function main(): Promise<number> {
  const root = process.cwd();
  const mode = flag("--mode") === "full" ? "full" : "fast";
  const keep = process.argv.includes("--keep");
  const previous = flag("--previous") ?? latestTag(root);

  const stampDir = freshStampDir();
  copyRepoTree(root, stampDir);
  console.log(`golden: stamped tree at ${stampDir}`);

  const inputs = JSON.parse(readFileSync(join(root, "golden/golden-inputs.json"), "utf8")) as Record<
    string,
    Record<string, unknown>
  >;
  const wizard = new Wizard(ALL_STEPS, { targetDir: stampDir, allowlist: [tmpdir()], inputs });
  wizard.runAll();

  for (const [from, to] of SURFACES) {
    const target = join(stampDir, to);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(root, from), target);
  }

  const allowlist = JSON.parse(readFileSync(join(root, "golden/allowlist.json"), "utf8"));
  const audit = auditStamp(stampDir, allowlist);
  if (!audit.pass) {
    console.log(`golden: audit failed: ${audit.violations.join(", ")}`);
    return 1;
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version?: string };
  const report = await runGoldenGates({
    stampDir,
    kitVersion: pkg.version ?? "0.0.0",
    previousVersion: previous,
    mode,
    keep: true,
    exec: realExec,
    onEvent: (line) => console.log(line),
  });

  if (mode === "full" && !report.blocked) {
    if (previous) {
      const update = await realExec(`npm run starter:update -- --release ${previous} --non-interactive`, stampDir);
      report.update = { ran: update.ok, reason: update.ok ? `updated from ${previous}` : update.log.slice(-500) };
      if (!update.ok) report.blocked = true;
    } else {
      report.update = { ran: false, reason: "no previous release tag or fixture" };
    }
    writeFileSync(join(stampDir, "golden-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(report.blocked ? "golden: BLOCKED" : "golden: passed");
  if (!report.blocked && !keep && existsSync(stampDir)) rmSync(stampDir, { recursive: true, force: true });
  return report.blocked ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
