// Native Claude Code adaptations:
// - bun:test -> node:test/node:assert/strict
// - PluginInput fixture -> HookEnvelope + HookRuntimeContext handler calls
// - output.output mutation checks -> HookExecutionResult.additionalContext and combineHookResults prefix checks
// - in-memory storage mock -> file-backed JSON state under mkdtemp CLAUDE_PLUGIN_DATA
// - session.compacted cleanup -> PreCompact envelope; SessionEnd cleanup case
// - finder-only direct import case dropped because shared collectDirectoryContext owns traversal in this migration
// - root-skip reference case inverted after Step 0 verification: root AGENTS.md is injected
// - non-reference coverage: missing sessionId/pluginDataDir, failed response, metadata fallback, lifecycle reinjection

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { combineHookResults } from "../../src/core/output.js";
import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createDirectoryAgentsInjector } from "../../src/hooks/directory-agents-injector/index.js";
import { makeLifecycleEnvelope, makePostToolEnvelope } from "../helpers/hook-fixtures.js";

const HOOK_ID = "directory-agents-injector";
const ROOT_AGENTS_CONTENT = "# ROOT AGENTS\nroot-level directives";
const SRC_AGENTS_CONTENT = "# SRC AGENTS\nsrc-level directives";
const COMPONENTS_AGENTS_CONTENT = "# COMPONENT AGENTS\ncomponents-level directives";

interface DirectoryInjectorFixture {
  readonly cwd: string;
  readonly dataDir: string;
}

describe("directory-agents-injector", () => {
  it("injects AGENTS.md content from file's parent directory into output", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const sourceFile = true;\n");

      const result = await invokeRead(fixture, "session-parent", { file_path: "src/file.ts" });

      assert.equal(result.hookId, HOOK_ID);
      assert.match(result.additionalContext ?? "", /\[Directory Context: src\/AGENTS\.md\]/);
      assert.match(result.additionalContext ?? "", /# SRC AGENTS/);
      assert.match(result.additionalContext ?? "", /src-level directives/);
      assertPrefixedCombinedContext(result, "directory-agents-injector: [Directory Context:");
    });
  });

  it("finds AGENTS.md files while walking up directories", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      const componentsDirectory = join(fixture.cwd, "src", "components");
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(componentsDirectory, "AGENTS.md"), COMPONENTS_AGENTS_CONTENT);
      writeFixtureFile(join(componentsDirectory, "button.ts"), "export const button = true;\n");

      const result = await invokeRead(fixture, "session-find", { file_path: "src/components/button.ts" });
      const context = result.additionalContext ?? "";

      assert.equal(countMarkers(context, "[Directory Context:"), 2);
      assert.ok(context.indexOf(SRC_AGENTS_CONTENT) < context.indexOf(COMPONENTS_AGENTS_CONTENT));
    });
  });

  it("injects root AGENTS.md when Claude Code does not auto-load it", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const rootFile = true;\n");

      const result = await invokeRead(fixture, "session-root-inject", { file_path: "file.ts" });

      assert.match(result.additionalContext ?? "", /\[Directory Context: AGENTS\.md\]/);
      assert.match(result.additionalContext ?? "", /# ROOT AGENTS/);
      assert.match(result.additionalContext ?? "", /root-level directives/);
    });
  });

  it("injects multiple AGENTS.md when walking up directory tree", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      const componentsDirectory = join(fixture.cwd, "src", "components");
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(componentsDirectory, "AGENTS.md"), COMPONENTS_AGENTS_CONTENT);
      writeFixtureFile(join(componentsDirectory, "button.ts"), "export const button = true;\n");

      const result = await invokeRead(fixture, "session-multiple", { file_path: "src/components/button.ts" });
      const context = result.additionalContext ?? "";

      assert.equal(countMarkers(context, "[Directory Context:"), 3);
      assert.ok(context.indexOf(ROOT_AGENTS_CONTENT) < context.indexOf(SRC_AGENTS_CONTENT));
      assert.ok(context.indexOf(SRC_AGENTS_CONTENT) < context.indexOf(COMPONENTS_AGENTS_CONTENT));
    });
  });

  it("does not re-inject already cached directories", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      const componentsDirectory = join(fixture.cwd, "src", "components");
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(componentsDirectory, "AGENTS.md"), COMPONENTS_AGENTS_CONTENT);
      writeFixtureFile(join(componentsDirectory, "button.ts"), "export const button = true;\n");

      const first = await invokeRead(fixture, "session-cache", { file_path: "src/components/button.ts" });
      const second = await invokeRead(fixture, "session-cache", { file_path: "src/components/button.ts" });

      assert.equal(countMarkers(first.additionalContext ?? "", "[Directory Context:"), 2);
      assert.deepEqual(second, { hookId: HOOK_ID });
    });
  });

  it("shows truncation notice when content is truncated", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), "# Truncated AGENTS\nabcdefghi");
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const sourceFile = true;\n");

      const result = await invokeRead(fixture, "session-truncated", { file_path: "src/file.ts" }, { content: "ok" }, 12);
      const context = result.additionalContext ?? "";

      assert.match(context, /# Truncated/);
      assert.match(
        context,
        /\[Note: Content was truncated to save context window space\. For full context, please read the file directly: src\/AGENTS\.md\]/
      );
    });
  });

  it("does nothing when filePath cannot be resolved", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);

      const result = await invokeRead(fixture, "session-empty-path", { file_path: "" });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("uses tool_response.metadata.filePath fallback when tool input has no path", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const sourceFile = true;\n");

      const result = await invokeRead(fixture, "session-metadata", {}, { content: "ok", metadata: { filePath: "src/file.ts" } });

      assert.match(result.additionalContext ?? "", /# SRC AGENTS/);
    });
  });

  it("PreCompact envelope deletes session state and allows reinjection on next PostToolUse Read", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const sourceFile = true;\n");
      const sessionId = "session-precompact";

      const first = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });
      const cleanup = await invokeLifecycle(fixture, "PreCompact", sessionId);
      const second = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });

      assert.match(first.additionalContext ?? "", /# SRC AGENTS/);
      assert.deepEqual(cleanup, { hookId: HOOK_ID });
      assert.match(second.additionalContext ?? "", /# SRC AGENTS/);
    });
  });

  it("SessionEnd envelope deletes session state", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "AGENTS.md"), SRC_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const sourceFile = true;\n");
      const sessionId = "session-end";

      const first = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });
      const cleanup = await invokeLifecycle(fixture, "SessionEnd", sessionId);
      const second = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });

      assert.match(first.additionalContext ?? "", /# SRC AGENTS/);
      assert.deepEqual(cleanup, { hookId: HOOK_ID });
      assert.match(second.additionalContext ?? "", /# SRC AGENTS/);
    });
  });

  it("Missing sessionId on envelope returns { hookId } without injecting", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const rootFile = true;\n");

      const result = await invokeRead(fixture, undefined, { file_path: "file.ts" });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("Missing pluginDataDir returns { hookId } without injecting", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const rootFile = true;\n");
      const envelope = makePostToolEnvelope("Read", "session-no-data", fixture.cwd, { file_path: "file.ts" }, { content: "ok" });

      const result = await createDirectoryAgentsInjector()(envelope, resolveRuntimeContext(fixture.cwd, {}));

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("Failed tool response skips injection", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const rootFile = true;\n");

      const result = await invokeRead(fixture, "session-failed", { file_path: "file.ts" }, { is_error: true });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("Missing tool response skips injection", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "AGENTS.md"), ROOT_AGENTS_CONTENT);
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const rootFile = true;\n");
      const envelope = makePostToolEnvelope("Read", "session-missing-response", fixture.cwd, { file_path: "file.ts" }, undefined);
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir });

      const result = await createDirectoryAgentsInjector()(envelope, context);

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });
});

async function withDirectoryInjectorFixture(run: (fixture: DirectoryInjectorFixture) => Promise<void> | void): Promise<void> {
  const cwd = mkdtempSync(join(tmpdir(), "directory-agents-injector-cwd-"));
  const dataDir = mkdtempSync(join(tmpdir(), "directory-agents-injector-data-"));
  try {
    await run({ cwd, dataDir });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
    rmSync(dataDir, { recursive: true, force: true });
  }
}

function writeFixtureFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

async function invokeRead(
  fixture: DirectoryInjectorFixture,
  sessionId: string | undefined,
  toolInput: Record<string, unknown>,
  toolResponse: unknown = { content: "ok" },
  maxContextChars = 20_000
) {
  const envelope = makePostToolEnvelope("Read", sessionId, fixture.cwd, toolInput, toolResponse);
  const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, Date.now, { maxContextChars });
  return createDirectoryAgentsInjector()(envelope, context);
}

async function invokeLifecycle(fixture: DirectoryInjectorFixture, eventName: "PreCompact" | "SessionEnd", sessionId: string) {
  const envelope = makeLifecycleEnvelope(eventName, sessionId, fixture.cwd);
  const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir });
  return createDirectoryAgentsInjector()(envelope, context);
}

function countMarkers(value: string, marker: string): number {
  return value.split(marker).length - 1;
}

function assertPrefixedCombinedContext(result: Awaited<ReturnType<typeof invokeRead>>, expectedPrefix: string): void {
  const output = combineHookResults("PostToolUse", [result]);
  assert.equal(output.hookSpecificOutput?.additionalContext?.startsWith(expectedPrefix), true);
}
