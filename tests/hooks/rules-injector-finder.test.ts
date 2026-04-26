// Ported from: docs/reference/hooks/rules-injector/finder.test.ts
// Adaptations:
// - bun:test -> node:test/node:assert/strict
// - findRuleFiles(projectRoot, homeDir, currentFile) -> loadMatchingRules({ projectRoot, targetPath, homedir, includeUserRules })
// - discovery assertions use MatchingRuleBlock projectRelativePath/body/matchReason instead of RuleFileCandidate internals where rules must match target
// - user-home rules default to disabled via includeUserRules: false; explicit includeUserRules: true cases cover generic user-home dirs
// Dropped reference cases:
// - .sisyphus/rules discovery cases dropped.
// - .opencode/rules and OPENCODE_USER_RULE_DIRS cases dropped.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { findProjectRoot, loadMatchingRules } from "../../src/hooks/shared/rule-discovery.js";

describe("loadMatchingRules", () => {
  it("discovers .github/instructions/*.instructions.md files", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".github/instructions/typescript.instructions.md", matchingRule("**/*.ts", "TS rules"));
      writeProjectFile(projectRoot, ".github/instructions/python.instructions.md", matchingRule("**/*.ts", "PY rules"));
      const targetPath = writeProjectFile(projectRoot, "src/index.ts", "code");

      const rules = loadProjectRules(projectRoot, homeDir, targetPath);
      const paths = rules.map((rule) => rule.projectRelativePath);

      assert.equal(paths.includes(".github/instructions/typescript.instructions.md"), true);
      assert.equal(paths.includes(".github/instructions/python.instructions.md"), true);
    });
  });

  it("ignores non-.instructions.md files in .github/instructions", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".github/instructions/valid.instructions.md", matchingRule("**/*.ts", "valid"));
      writeProjectFile(projectRoot, ".github/instructions/invalid.md", matchingRule("**/*.ts", "invalid"));
      writeProjectFile(projectRoot, ".github/instructions/readme.txt", matchingRule("**/*.ts", "readme"));
      const targetPath = writeProjectFile(projectRoot, "index.ts", "code");

      const paths = loadProjectRules(projectRoot, homeDir, targetPath).map((rule) => rule.projectRelativePath);

      assert.equal(paths.includes(".github/instructions/valid.instructions.md"), true);
      assert.equal(paths.some((path) => path.endsWith("invalid.md")), false);
      assert.equal(paths.some((path) => path.endsWith("readme.txt")), false);
    });
  });

  it("discovers nested .instructions.md files in subdirectories", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".github/instructions/frontend/react.instructions.md", matchingRule("**/*.tsx", "React rules"));
      const targetPath = writeProjectFile(projectRoot, "app.tsx", "code");

      const paths = loadProjectRules(projectRoot, homeDir, targetPath).map((rule) => rule.projectRelativePath);

      assert.equal(paths.includes(".github/instructions/frontend/react.instructions.md"), true);
    });
  });

  it("discovers copilot-instructions.md at project root as always-applied single file", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".github/copilot-instructions.md", "Global instructions");
      const targetPath = writeProjectFile(projectRoot, "src/deep/file.ts", "code");

      const rule = loadProjectRules(projectRoot, homeDir, targetPath).find((candidate) => candidate.projectRelativePath === ".github/copilot-instructions.md");

      assert.notEqual(rule, undefined);
      assert.equal(rule?.distance, 0);
      assert.equal(rule?.matchReason, "copilot-instructions (always apply)");
    });
  });

  it("discovers .claude/rules, .cursor/rules, and .mdc files", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".claude/rules/claude.md", matchingRule("**/*.ts", "claude"));
      writeProjectFile(projectRoot, ".cursor/rules/cursor.md", matchingRule("**/*.ts", "cursor"));
      writeProjectFile(projectRoot, ".claude/rules/advanced.mdc", matchingRule("**/*.ts", "mdc"));
      const targetPath = writeProjectFile(projectRoot, "index.ts", "code");

      const paths = loadProjectRules(projectRoot, homeDir, targetPath).map((rule) => rule.projectRelativePath);

      assert.equal(paths.includes(".claude/rules/claude.md"), true);
      assert.equal(paths.includes(".cursor/rules/cursor.md"), true);
      assert.equal(paths.includes(".claude/rules/advanced.mdc"), true);
    });
  });

  it("sorts project rules by proximity and keeps same-distance ties", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".claude/rules/root-a.md", matchingRule("src/feature/**/*.ts", "root a"));
      writeProjectFile(projectRoot, ".cursor/rules/root-b.md", matchingRule("src/feature/**/*.ts", "root b"));
      writeProjectFile(projectRoot, "src/feature/.claude/rules/feature.md", matchingRule("src/feature/**/*.ts", "feature"));
      const targetPath = writeProjectFile(projectRoot, "src/feature/a.ts", "code");

      const rules = loadProjectRules(projectRoot, homeDir, targetPath);

      assert.equal(rules[0]?.projectRelativePath, "src/feature/.claude/rules/feature.md");
      assert.deepEqual(
        rules.filter((rule) => rule.distance === 2).map((rule) => rule.projectRelativePath).sort(),
        [".claude/rules/root-a.md", ".cursor/rules/root-b.md"].sort()
      );
    });
  });

  it("does not discover user-home rules by default", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeFixtureFile(join(homeDir, ".claude", "rules", "global.md"), alwaysRule("Global user rules"));
      const targetPath = writeProjectFile(projectRoot, "app.ts", "code");

      const rules = loadMatchingRules({ projectRoot, targetPath, homedir: homeDir, includeUserRules: false });

      assert.equal(rules.some((rule) => rule.absolutePath.includes("global.md")), false);
    });
  });

  it("discovers generic user-home rule directories when includeUserRules is true", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeFixtureFile(join(homeDir, ".claude", "rules", "global.md"), alwaysRule("claude user"));
      writeFixtureFile(join(homeDir, ".cursor", "rules", "global.md"), alwaysRule("cursor user"));
      writeFixtureFile(join(homeDir, ".github", "instructions", "global.instructions.md"), matchingRule("**/*.ts", "github user"));
      const targetPath = writeProjectFile(projectRoot, "app.ts", "code");

      const rules = loadMatchingRules({ projectRoot, targetPath, homedir: homeDir, includeUserRules: true });
      const userRules = rules.filter((rule) => rule.distance === 9999);

      assert.equal(userRules.some((rule) => rule.absolutePath.includes(join(".claude", "rules", "global.md"))), true);
      assert.equal(userRules.some((rule) => rule.absolutePath.includes(join(".cursor", "rules", "global.md"))), true);
      assert.equal(userRules.some((rule) => rule.absolutePath.includes(join(".github", "instructions", "global.instructions.md"))), true);
    });
  });

  it("deduplicates candidates by realpath", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      const original = writeProjectFile(projectRoot, ".claude/rules/original.md", matchingRule("**/*.ts", "one body"));
      const link = join(projectRoot, ".cursor", "rules", "linked.md");
      mkdirSync(dirname(link), { recursive: true });
      symlinkSync(original, link);
      const targetPath = writeProjectFile(projectRoot, "index.ts", "code");

      const rules = loadProjectRules(projectRoot, homeDir, targetPath).filter((rule) => rule.body === "one body");

      assert.equal(rules.length, 1);
    });
  });

  it("deduplicates rule files discovered through a symlinked rule directory by realpath", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      writeProjectFile(projectRoot, ".claude/rules/original.md", matchingRule("**/*.ts", "one body"));
      mkdirSync(join(projectRoot, ".cursor"), { recursive: true });
      symlinkSync(join(projectRoot, ".claude", "rules"), join(projectRoot, ".cursor", "rules"), "dir");
      const targetPath = writeProjectFile(projectRoot, "index.ts", "code");

      const rules = loadProjectRules(projectRoot, homeDir, targetPath).filter((rule) => rule.body === "one body");

      assert.equal(rules.length, 1);
    });
  });

  it("uses cwd boundary as project root when no project marker is found", () => {
    withRuleFinderFixture(({ projectRoot, homeDir }) => {
      const targetPath = writeProjectFile(projectRoot, "src/index.ts", "code");
      writeProjectFile(projectRoot, "src/.claude/rules/local.md", matchingRule("src/**/*.ts", "local"));

      const boundaryRoot = findProjectRoot(targetPath, projectRoot);
      const rules = loadMatchingRules({ projectRoot: boundaryRoot ?? projectRoot, targetPath, homedir: homeDir, includeUserRules: false });

      assert.equal(boundaryRoot, projectRoot);
      assert.equal(rules.some((rule) => rule.body === "local"), true);
    }, false);
  });
});

interface RuleFinderFixture {
  readonly root: string;
  readonly projectRoot: string;
  readonly homeDir: string;
}

function withRuleFinderFixture(run: (fixture: RuleFinderFixture) => void, includeMarker = true): void {
  const root = mkdtempSync(join(tmpdir(), "rules-finder-"));
  const projectRoot = join(root, "project");
  const homeDir = join(root, "home");
  try {
    mkdirSync(projectRoot, { recursive: true });
    mkdirSync(homeDir, { recursive: true });
    if (includeMarker) {
      mkdirSync(join(projectRoot, ".git"), { recursive: true });
    }
    run({ root, projectRoot, homeDir });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function loadProjectRules(projectRoot: string, homeDir: string, targetPath: string) {
  return loadMatchingRules({ projectRoot, targetPath, homedir: homeDir, includeUserRules: false });
}

function writeProjectFile(projectRoot: string, relativePath: string, content: string): string {
  const path = join(projectRoot, relativePath);
  writeFixtureFile(path, content);
  return path;
}

function writeFixtureFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function matchingRule(glob: string, body: string): string {
  return `---\napplyTo: ${glob}\n---\n${body}`;
}

function alwaysRule(body: string): string {
  return `---\nalwaysApply: true\n---\n${body}`;
}
