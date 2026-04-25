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
  it("documents user configuration requirements", () => {
    const readme = readRequiredDoc("README.md");

    assertIncludes(readme, "enabled_hooks", "README.md");
    assertIncludes(readme, "disabled_hooks", "README.md");
    assertIncludes(readme, ".claude/hook-pack.local.md", "README.md");
  });

  it("documents foundation runtime boundaries", () => {
    const foundation = readRequiredDoc("docs/architecture/hook-pack-foundation.md");

    assertIncludes(foundation, "OpenCode reference hooks are migration inventory", "foundation architecture docs");
    assertIncludes(foundation, "Native Claude Code events are the runtime boundary", "foundation architecture docs");
  });

  it("documents migration governance requirements", () => {
    const governance = readRequiredDoc("docs/architecture/migration-governance.md");

    assertIncludes(governance, "Migration Feasibility Record", "migration governance docs");
    assertIncludes(governance, "portable", "migration governance docs");
    assertIncludes(governance, "redesign-needed", "migration governance docs");
  });
});
