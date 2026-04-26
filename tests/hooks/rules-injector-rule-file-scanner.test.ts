// Ported from: docs/reference/hooks/rules-injector/rule-file-scanner.test.ts
// Adaptations:
// - bun:test -> node:test/node:assert/strict
// - generic .claude/rules fixture replaces dropped orchestration-specific fixture path
// Dropped reference cases:
// - .sisyphus/rules discovery fixture path removed.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { findRuleFilesRecursive } from "../../src/hooks/shared/rule-discovery.js";

describe("findRuleFilesRecursive", () => {
  it("returns rule files outside excluded nested directories", () => {
    withScannerFixture((root) => {
      const rulesDirectory = join(root, ".claude", "rules");
      mkdirSync(join(rulesDirectory, "node_modules", "fake"), { recursive: true });
      mkdirSync(join(rulesDirectory, ".git"), { recursive: true });
      writeFileSync(join(rulesDirectory, "foo.md"), "root rule", "utf8");
      writeFileSync(join(rulesDirectory, "node_modules", "fake", "x.md"), "ignored dependency rule", "utf8");
      writeFileSync(join(rulesDirectory, ".git", "x.md"), "ignored git rule", "utf8");

      const results: string[] = [];
      findRuleFilesRecursive(rulesDirectory, results);

      assert.deepEqual(results, [join(rulesDirectory, "foo.md")]);
    });
  });

  it("only accepts .instructions.md files inside .github/instructions", () => {
    withScannerFixture((root) => {
      const instructionsDirectory = join(root, ".github", "instructions");
      mkdirSync(instructionsDirectory, { recursive: true });
      writeFileSync(join(instructionsDirectory, "valid.instructions.md"), "valid", "utf8");
      writeFileSync(join(instructionsDirectory, "invalid.md"), "invalid", "utf8");
      writeFileSync(join(instructionsDirectory, "valid.mdc"), "invalid for github", "utf8");

      const results: string[] = [];
      findRuleFilesRecursive(instructionsDirectory, results);

      assert.deepEqual(results, [join(instructionsDirectory, "valid.instructions.md")]);
    });
  });
});

function withScannerFixture(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "rules-scanner-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
