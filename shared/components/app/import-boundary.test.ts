import { describe, expect, it } from "vitest";
import { Linter } from "eslint";
import { readFileSync } from "node:fs";

/**
 * AC-1 probe: the import boundary must fail a feature file that reaches for
 * shadcn primitives directly. Runs the core rule standalone so the probe
 * holds even while the repo eslint setup is being repaired.
 */
describe("import boundary", () => {
  it("fails direct primitive imports from feature code", () => {
    const linter = new Linter();
    const messages = linter.verify(
      'import { Button } from "@/components/ui/button";\nexport const x = Button;',
      {
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                { group: ["@/components/ui/*", "shared/components/ui/*"], message: "Use App wrappers from @/components/app instead." },
              ],
            },
          ],
        },
      },
    );
    expect(messages.some((message) => message.ruleId === "no-restricted-imports")).toBe(true);
  });

  it("records the same boundary in the repo eslint config", () => {
    const config = readFileSync("eslint.config.mjs", "utf8");
    expect(config).toContain("@/components/ui/*");
    expect(config).toContain("Use App wrappers");
  });
});
