// Native Claude Code adaptations:
// - bun:test -> node:test/node:assert/strict
// - createRuleInjectionProcessor mutation of output.output -> createRulesInjector handler returning HookExecutionResult.additionalContext
// - PluginInput/output fixtures -> HookEnvelope + HookRuntimeContext calls
// - output-combiner assertion added for <hookId>: prefixed combined context
// - session.compacted cleanup -> PreCompact envelope; SessionEnd cleanup case added
// - parsed-rule cache tests use file-backed CLAUDE_PLUGIN_DATA cache across handler instances
// Dropped cases:
// - Orchestration-specific user rule dirs and env controls dropped.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { combineHookResults } from "../../src/core/output.js";
import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createRulesInjector } from "../../src/hooks/rules-injector/index.js";
import { makeLifecycleEnvelope, makePostToolEnvelope, withHookFixture } from "../helpers/hook-fixtures.js";

const HOOK_ID = "rules-injector";

describe("rules-injector", () => {
  it("injects nearest matching project rule files once per session", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      mkdirSync(join(cwd, "src", "feature", ".claude", "rules"), { recursive: true });
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "feature", "a.ts"), "export const a = 1;\n");
      writeFixtureFileWithParents(join(cwd, "src", "feature", ".claude", "rules", "feature.md"), "---\napplyTo: src/feature/**/*.ts\n---\nFeature rule wins by proximity.\n");
      const hook = createRulesInjector();
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const envelope = makePostToolEnvelope("Read", "session-1", cwd, { file_path: join(cwd, "src", "feature", "a.ts") }, { content: "read ok" });

      const first = await hook(envelope, context);
      assert.match(first.additionalContext ?? "", /\[Rule: src\/feature\/\.claude\/rules\/feature\.md\]/);
      assert.match(first.additionalContext ?? "", /Feature rule wins by proximity\./);
      assert.doesNotMatch(first.additionalContext ?? "", /applyTo:/);

      const second = await hook(envelope, context);
      assert.equal(second.additionalContext, undefined);

      await hook(makeLifecycleEnvelope("PreCompact", "session-1", cwd), context);
      const afterCleanup = await hook(envelope, context);
      assert.match(afterCleanup.additionalContext ?? "", /Feature rule wins by proximity\./);
    });
  });

  it("injects matching rules for Write, Edit, and MultiEdit successful tool responses", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/typescript.md", "src/**/*.ts", "Write edit rules");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const file = true;\n");
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const hook = createRulesInjector();

      for (const toolName of ["Write", "Edit", "MultiEdit"] as const) {
        const result = await hook(makePostToolEnvelope(toolName, `session-${toolName}`, cwd, { file_path: "src/file.ts" }, { success: true }), context);
        assert.match(result.additionalContext ?? "", /Write edit rules/);
      }
    });
  });

  it("uses tool input path before response metadata fallback", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Input path rule");
      writeRule(cwd, ".claude/rules/other.md", "other/**/*.ts", "Metadata path rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      writeFixtureFileWithParents(join(cwd, "other", "file.ts"), "export const other = true;\n");
      const result = await createRulesInjector()(makePostToolEnvelope("Read", "session-path-priority", cwd, { file_path: "src/file.ts" }, { metadata: { filePath: "other/file.ts" } }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }));

      assert.match(result.additionalContext ?? "", /Input path rule/);
      assert.doesNotMatch(result.additionalContext ?? "", /Metadata path rule/);
    });
  });

  it("uses response metadata fallback when tool input has no path", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Metadata fallback rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const result = await createRulesInjector()(makePostToolEnvelope("Read", "session-metadata", cwd, {}, { metadata: { filePath: "src/file.ts" } }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }));

      assert.match(result.additionalContext ?? "", /Metadata fallback rule/);
    });
  });

  it("matches rules when cwd is reached through a symlink", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const symlinkCwd = join(dirname(cwd), "workspace-link");
      symlinkSync(cwd, symlinkCwd, "dir");
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Symlink cwd rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");

      const result = await createRulesInjector()(
        makePostToolEnvelope("Read", "session-symlink-cwd", symlinkCwd, { file_path: "src/file.ts" }, { content: "ok" }),
        resolveRuntimeContext(symlinkCwd, { CLAUDE_PLUGIN_DATA: dataDir })
      );

      assert.match(result.additionalContext ?? "", /Symlink cwd rule/);
    });
  });

  it("matches rule globs against canonical target paths", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Canonical target rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      symlinkSync(join(cwd, "src"), join(cwd, "linked-src"), "dir");

      const result = await createRulesInjector()(
        makePostToolEnvelope("Read", "session-symlink-target", cwd, { file_path: "linked-src/file.ts" }, { content: "ok" }),
        resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir })
      );

      assert.match(result.additionalContext ?? "", /Canonical target rule/);
    });
  });

  it("skips failed responses, missing sessionId, missing pluginDataDir, untracked tools, and outside-cwd targets", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Skipped rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const outsideDir = join(tmpdir(), `rules-outside-${Date.now()}`);
      mkdirSync(outsideDir, { recursive: true });
      writeFileSync(join(outsideDir, "file.ts"), "export const outside = true;\n", "utf8");
      try {
        const hook = createRulesInjector();
        const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });

        assert.deepEqual(await hook(makePostToolEnvelope("Read", "session-failed", cwd, { file_path: "src/file.ts" }, { is_error: true }), context), { hookId: HOOK_ID });
        assert.deepEqual(await hook(makePostToolEnvelope("Read", undefined, cwd, { file_path: "src/file.ts" }, { content: "ok" }), context), { hookId: HOOK_ID });
        assert.deepEqual(await hook(makePostToolEnvelope("Read", "session-no-data", cwd, { file_path: "src/file.ts" }, { content: "ok" }), resolveRuntimeContext(cwd, {})), { hookId: HOOK_ID });
        assert.deepEqual(await hook(makePostToolEnvelope("Bash", "session-bash", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context), { hookId: HOOK_ID });
        assert.deepEqual(await hook(makePostToolEnvelope("Read", "session-outside", cwd, { file_path: join(outsideDir, "file.ts") }, { content: "ok" }), context), { hookId: HOOK_ID });
      } finally {
        rmSync(outsideDir, { recursive: true, force: true });
      }
    });
  });

  it("deduplicates by content hash across distinct rule files", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/first.md", "src/**/*.ts", "Duplicate body");
      writeRule(cwd, ".cursor/rules/second.md", "src/**/*.ts", "Duplicate body");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");

      const result = await createRulesInjector()(makePostToolEnvelope("Read", "session-content-hash", cwd, { file_path: "src/file.ts" }, { content: "ok" }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }));

      assert.equal(countMarkers(result.additionalContext ?? "", "Duplicate body"), 1);
    });
  });

  it("formats combined additional context with rules-injector prefix", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Combined output rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const result = await createRulesInjector()(makePostToolEnvelope("Read", "session-combined", cwd, { file_path: "src/file.ts" }, { content: "ok" }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }));
      const output = combineHookResults("PostToolUse", [result]);

      assert.equal(output.hookSpecificOutput?.additionalContext?.startsWith("rules-injector: [Rule: .claude/rules/src.md]"), true);
    });
  });

  it("injects copilot-instructions single file without frontmatter", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, ".github", "copilot-instructions.md"), "Single file instructions\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");

      const result = await createRulesInjector()(makePostToolEnvelope("Read", "session-copilot", cwd, { file_path: "src/file.ts" }, { content: "ok" }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }));

      assert.match(result.additionalContext ?? "", /\[Rule: \.github\/copilot-instructions\.md\]/);
      assert.match(result.additionalContext ?? "", /\[Match: copilot-instructions \(always apply\)\]/);
      assert.match(result.additionalContext ?? "", /Single file instructions/);
    });
  });

  it("includes user-home rules only when includeUserRules is true", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const homeDir = join(cwd, "home");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      writeFixtureFileWithParents(join(homeDir, ".claude", "rules", "global.md"), "---\nalwaysApply: true\n---\nUser home rule\n");

      const envelope = makePostToolEnvelope("Read", "session-user-false", cwd, { file_path: "src/file.ts" }, { content: "ok" });
      const excluded = await createRulesInjector()(envelope, resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir, HOME: homeDir }, Date.now, { includeUserRules: false }));
      const included = await createRulesInjector()(makePostToolEnvelope("Read", "session-user-true", cwd, { file_path: "src/file.ts" }, { content: "ok" }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir, HOME: homeDir }, Date.now, { includeUserRules: true }));

      assert.equal(excluded.additionalContext, undefined);
      assert.match(included.additionalContext ?? "", /User home rule/);
    });
  });

  it("parsed rule cache survives across sessions when realpath, mtimeMs, and size are stable", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const rulePath = writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Stable cached body");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const timestamp = new Date("2026-01-01T00:00:00.000Z");
      utimesSync(rulePath, timestamp, timestamp);
      const originalSize = statSync(rulePath).size;

      const first = await createRulesInjector()(makePostToolEnvelope("Read", "session-cache-a", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context);
      writeFixtureFileWithParents(rulePath, "---\napplyTo: src/**/*.ts\n---\nChanged cache body\n");
      assert.equal(statSync(rulePath).size, originalSize);
      utimesSync(rulePath, timestamp, timestamp);
      const second = await createRulesInjector()(makePostToolEnvelope("Read", "session-cache-b", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context);

      assert.match(first.additionalContext ?? "", /Stable cached body/);
      assert.match(second.additionalContext ?? "", /Stable cached body/);
      assert.doesNotMatch(second.additionalContext ?? "", /Changed cache body/);
    });
  });

  it("parsed rule cache invalidates when mtimeMs changes", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const rulePath = writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Initial body");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });

      const first = await createRulesInjector()(makePostToolEnvelope("Read", "session-mtime-a", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context);
      writeFixtureFileWithParents(rulePath, "---\napplyTo: src/**/*.ts\n---\nChanged mtime body\n");
      await new Promise((resolve) => setTimeout(resolve, 5));
      utimesSync(rulePath, new Date(), new Date());
      const second = await createRulesInjector()(makePostToolEnvelope("Read", "session-mtime-b", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context);

      assert.match(first.additionalContext ?? "", /Initial body/);
      assert.match(second.additionalContext ?? "", /Changed mtime body/);
    });
  });

  it("parsed rule cache invalidates when size changes", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const rulePath = writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "Small body");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const timestamp = new Date("2026-01-01T00:00:00.000Z");
      utimesSync(rulePath, timestamp, timestamp);

      const first = await createRulesInjector()(makePostToolEnvelope("Read", "session-size-a", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context);
      writeFixtureFileWithParents(rulePath, "---\napplyTo: src/**/*.ts\n---\nA much larger changed body\n");
      utimesSync(rulePath, timestamp, timestamp);
      const second = await createRulesInjector()(makePostToolEnvelope("Read", "session-size-b", cwd, { file_path: "src/file.ts" }, { content: "ok" }), context);

      assert.match(first.additionalContext ?? "", /Small body/);
      assert.match(second.additionalContext ?? "", /A much larger changed body/);
    });
  });

  it("PreCompact resets in-session dedupe but does not clear parsed-rule cache", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const rulePath = writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "PreCompact cached body");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const hook = createRulesInjector();
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const envelope = makePostToolEnvelope("Read", "session-precompact", cwd, { file_path: "src/file.ts" }, { content: "ok" });
      const timestamp = new Date("2026-01-01T00:00:00.000Z");
      utimesSync(rulePath, timestamp, timestamp);
      const originalSize = statSync(rulePath).size;

      const first = await hook(envelope, context);
      writeFixtureFileWithParents(rulePath, "---\napplyTo: src/**/*.ts\n---\nPreCompact change body\n");
      assert.equal(statSync(rulePath).size, originalSize);
      utimesSync(rulePath, timestamp, timestamp);
      await hook(makeLifecycleEnvelope("PreCompact", "session-precompact", cwd), context);
      const afterCleanup = await hook(envelope, context);

      assert.match(first.additionalContext ?? "", /PreCompact cached body/);
      assert.match(afterCleanup.additionalContext ?? "", /PreCompact cached body/);
      assert.doesNotMatch(afterCleanup.additionalContext ?? "", /PreCompact change body/);
    });
  });

  it("SessionEnd resets per-session dedupe and removes session scan-cache file", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "SessionEnd rule");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");
      const hook = createRulesInjector();
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const envelope = makePostToolEnvelope("Read", "session-end", cwd, { file_path: "src/file.ts" }, { content: "ok" });
      const scanCachePath = join(dataDir, "rules-injector", "scan-cache", "session-end.json");

      const first = await hook(envelope, context);
      assert.equal(existsSync(scanCachePath), true);
      await hook(makeLifecycleEnvelope("SessionEnd", "session-end", cwd), context);
      const afterCleanup = await hook(envelope, context);

      assert.match(first.additionalContext ?? "", /SessionEnd rule/);
      assert.match(afterCleanup.additionalContext ?? "", /SessionEnd rule/);
      assert.equal(existsSync(scanCachePath), true);
      await hook(makeLifecycleEnvelope("SessionEnd", "session-end", cwd), context);
      assert.equal(existsSync(scanCachePath), false);
    });
  });

  it("truncates long rule context and includes read-file notice", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeRule(cwd, ".claude/rules/src.md", "src/**/*.ts", "12345678901234567890");
      writeFixtureFileWithParents(join(cwd, "package.json"), "{}\n");
      writeFixtureFileWithParents(join(cwd, "src", "file.ts"), "export const src = true;\n");

      const result = await createRulesInjector()(makePostToolEnvelope("Read", "session-truncate", cwd, { file_path: "src/file.ts" }, { content: "ok" }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }, Date.now, { maxContextChars: 10 }));

      assert.match(result.additionalContext ?? "", /1234567890/);
      assert.match(result.additionalContext ?? "", /\[Note: Content was truncated to save context window space\. For full context, please read the file directly: \.claude\/rules\/src\.md\]/);
    });
  });
});

function writeRule(cwd: string, relativePath: string, glob: string, body: string): string {
  const rulePath = join(cwd, relativePath);
  writeFixtureFileWithParents(rulePath, `---\napplyTo: ${glob}\n---\n${body}\n`);
  return rulePath;
}

function countMarkers(value: string, marker: string): number {
  return value.split(marker).length - 1;
}

function writeFixtureFileWithParents(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}
