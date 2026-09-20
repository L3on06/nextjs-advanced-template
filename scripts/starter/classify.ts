export type ChangeLabel = "patch" | "minor" | "major";

/** Glob to label map. First match wins, ordered most specific first. */
const RULES: { pattern: RegExp; label: ChangeLabel }[] = [
  { pattern: /^docs\/CORE-CONTRACT\.md$/, label: "major" },
  { pattern: /^docs\/ARCHITECTURE\.md$/, label: "major" },
  { pattern: /^docs\/VERSIONING\.md$/, label: "major" },
  { pattern: /^shared\/permissions\/config\.ts$/, label: "major" },
  { pattern: /^firestore\.rules$/, label: "major" },
  { pattern: /^storage\.rules$/, label: "major" },
  { pattern: /^\.env\.example$/, label: "major" },
  { pattern: /^setup\//, label: "minor" },
  { pattern: /^scripts\//, label: "minor" },
  { pattern: /^shared\//, label: "minor" },
  { pattern: /^functions\//, label: "minor" },
  { pattern: /^migrations\//, label: "minor" },
  { pattern: /^docs\//, label: "patch" },
  { pattern: /^skills\//, label: "patch" },
  { pattern: /^\.agents\//, label: "patch" },
];

export function classifyChange(path: string, needsMigration: boolean): { label: ChangeLabel; migration: boolean } {
  const rule = RULES.find((entry) => entry.pattern.test(path));
  return { label: rule?.label ?? "patch", migration: needsMigration };
}
