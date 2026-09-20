export interface Migration {
  version: string;
  from: string;
  to: string;
  describe: string;
  /** Transform files in the tree. Idempotent: running twice equals running once. No writes outside root. */
  migrate: (root: string) => string[];
}

function semverCompare(left: string, right: string): number {
  const parse = (value: string) => value.split(".").map((entry) => Number(entry));
  const [l1 = 0, l2 = 0, l3 = 0] = parse(left);
  const [r1 = 0, r2 = 0, r3 = 0] = parse(right);
  return l1 - r1 || l2 - r2 || l3 - r3;
}

function inRange(version: string, from: string, to: string): boolean {
  return semverCompare(version, from) > 0 && semverCompare(version, to) <= 0;
}

/** Migrations covering the installed to target step, in semver order. */
export function applicableMigrations(
  installed: string,
  target: string,
  all: Migration[],
): Migration[] {
  return all
    .filter((migration) => inRange(migration.version, installed, target))
    .sort((left, right) => semverCompare(left.version, right.version));
}

export interface MigrationReport {
  version: string;
  changed: string[];
}

/** Run each migration once, in order, collecting changed paths. */
export function runMigrations(root: string, migrations: Migration[]): MigrationReport[] {
  const reports: MigrationReport[] = [];
  for (const migration of migrations) {
    reports.push({ version: migration.version, changed: migration.migrate(root) });
  }
  return reports;
}
