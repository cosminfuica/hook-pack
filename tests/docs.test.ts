import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "..", "..");

function readRequiredDoc(pathFromRoot: string): string {
  const absolutePath = resolve(repoRoot, pathFromRoot);
  assert.ok(existsSync(absolutePath), `${pathFromRoot} must exist`);

  return readFileSync(absolutePath, "utf8");
}

function assertIncludes(source: string, expected: string, label: string): void {
  assert.ok(source.includes(expected), `${label} must include ${expected}`);
}

describe("foundation documentation", () => {
  it("README points users at install + configuration docs without enumerating hook IDs", () => {
    const readme = readRequiredDoc("README.md");

    assertIncludes(readme, "/plugin marketplace add", "README.md");
    assertIncludes(readme, "/plugin install", "README.md");
    assertIncludes(readme, "docs/configuration.md", "README.md");
  });

  it("documents user configuration requirements in docs/configuration.md", () => {
    const config = readRequiredDoc("docs/configuration.md");

    assertIncludes(config, "enabled_hooks", "docs/configuration.md");
    assertIncludes(config, "disabled_hooks", "docs/configuration.md");
    assertIncludes(config, ".claude/hook-pack.local.md", "docs/configuration.md");
    assertIncludes(config, "include_user_rules", "docs/configuration.md");
    assertIncludes(config, "max_context_chars", "docs/configuration.md");
    assertIncludes(config, "PreCompact", "docs/configuration.md");
    assertIncludes(config, "SessionEnd", "docs/configuration.md");
  });

  it("documents Tier 1 shipped hook IDs and lifecycle cleanup", () => {
    const config = readRequiredDoc("docs/configuration.md");

    for (const hookId of [
      "comment-checker",
      "directory-agents-injector",
      "directory-readme-injector",
      "rules-injector",
      "write-existing-file-guard"
    ]) {
      assertIncludes(config, hookId, "docs/configuration.md");
    }
    assertIncludes(config, "PreCompact", "docs/configuration.md");
    assertIncludes(config, "SessionEnd", "docs/configuration.md");
  });
});
