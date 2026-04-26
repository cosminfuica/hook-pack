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

  it("documents Tier 1 migrated hook IDs, lifecycle cleanup, and neutrality posture", () => {
    const readme = readRequiredDoc("README.md");
    const governance = readRequiredDoc("docs/architecture/migration-governance.md");

    for (const hookId of [
      "comment-checker",
      "directory-agents-injector",
      "directory-readme-injector",
      "rules-injector",
      "write-existing-file-guard"
    ]) {
      assertIncludes(readme, hookId, "README.md");
      const recordStart = governance.indexOf(`## Migration Feasibility Record: ${hookId}`);
      assert.notEqual(recordStart, -1, `migration governance docs must include record header for ${hookId}`);
      const nextRecordStart = governance.indexOf("## Migration Feasibility Record:", recordStart + 1);
      const record = governance.slice(recordStart, nextRecordStart === -1 ? undefined : nextRecordStart);
      assertIncludes(record, `Stable ID: ${hookId}`, `record stable ID for ${hookId}`);
      assertIncludes(record, "Decision: portable", `record for ${hookId}`);
      assertIncludes(record, "docs/reference/hooks", `record reference source for ${hookId}`);
      assertIncludes(record, "### Tests required before implementation", `record test list for ${hookId}`);
      assertIncludes(record, "Reference test ports:", `record port list for ${hookId}`);
      assertIncludes(record, "### State and lifecycle", `record state section for ${hookId}`);
      assertIncludes(record, "### Orchestration neutrality", `record neutrality section for ${hookId}`);
    }

    assertIncludes(readme, "PreCompact", "README.md");
    assertIncludes(readme, "SessionEnd", "README.md");
    assertIncludes(readme, "include_user_rules", "README.md");
    assertIncludes(readme, "max_context_chars", "README.md");
  });
});
