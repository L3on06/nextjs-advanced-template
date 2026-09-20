import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DIRS = ["shared/components/app", "shared/states"];

function sourceFiles(): string[] {
  const out: string[] = [];
  for (const dir of DIRS) {
    for (const entry of readdirSync(dir)) {
      if (/\.(tsx?|ts)$/.test(entry) && !entry.includes(".test.")) out.push(join(dir, entry));
    }
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

/** Human copy looks like words and spaces with no code characters. */
const COPY_LIKE = /^[A-Za-z][A-Za-z ,.'!?-]* [A-Za-z ,.'!?-]*$/;

describe("no hardcoded UI strings", () => {
  it("finds no sentence like text outside T keys", () => {
    const hits: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(readFileSync(file, "utf8"));
      for (const match of src.matchAll(/>([^<>{}]+)</g)) {
        const text = match[1].trim().replace(/\s+/g, " ");
        if (text.length > 0 && COPY_LIKE.test(text)) hits.push(`${file}: ${text}`);
      }
    }
    expect(hits).toEqual([]);
  });
});

describe("no raw visual literals", () => {
  it("finds no hex colors or px/rem values", () => {
    const hits: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(readFileSync(file, "utf8"));
      for (const match of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem)\b/g)) {
        hits.push(`${file}: ${match[0]}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
