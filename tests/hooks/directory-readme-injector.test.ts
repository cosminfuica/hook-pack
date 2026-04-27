// Native Claude Code adaptations:
// - bun:test -> node:test/node:assert/strict
// - PluginInput fixture -> HookEnvelope + HookRuntimeContext handler calls
// - output.output mutation checks -> HookExecutionResult.additionalContext and combineHookResults prefix checks
// - in-memory storage mock -> file-backed JSON state under mkdtemp CLAUDE_PLUGIN_DATA
// - session.compacted cleanup -> PreCompact envelope; SessionEnd cleanup case
// - finder-only direct import case dropped because shared collectDirectoryContext owns traversal in this migration
// - non-reference coverage: missing sessionId/pluginDataDir, failed response, metadata fallback, lifecycle reinjection

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { combineHookResults } from "../../src/core/output.js";
import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createDirectoryReadmeInjector } from "../../src/hooks/directory-readme-injector/index.js";
import { makeLifecycleEnvelope, makePostToolEnvelope } from "../helpers/hook-fixtures.js";

const HOOK_ID = "directory-readme-injector";

interface DirectoryInjectorFixture {
  readonly cwd: string;
  readonly dataDir: string;
}

describe("directory-readme-injector", () => {
  it("injects README.md content from file's parent directory into output", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      const sourceDirectory = join(fixture.cwd, "src");
      writeFixtureFile(join(sourceDirectory, "README.md"), "# Source README\nlocal context");
      writeFixtureFile(join(sourceDirectory, "file.ts"), "export const file = true;\n");

      const result = await invokeRead(fixture, "session-parent", { file_path: "src/file.ts" });

      assert.equal(result.hookId, HOOK_ID);
      assert.match(result.additionalContext ?? "", /\[Project README: src\/README\.md\]/);
      assert.match(result.additionalContext ?? "", /# Source README/);
      assert.match(result.additionalContext ?? "", /local context/);
      assertPrefixedCombinedContext(result, "directory-readme-injector: [Project README:");
    });
  });

  it("includes root-level README.md (unlike agents-injector)", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README\nroot context");
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const rootFile = true;\n");

      const result = await invokeRead(fixture, "session-root", { file_path: "file.ts" });

      assert.match(result.additionalContext ?? "", /\[Project README: README\.md\]/);
      assert.match(result.additionalContext ?? "", /# Root README/);
      assert.match(result.additionalContext ?? "", /root context/);
    });
  });

  it("injects multiple README.md when walking up directory tree", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      const componentsDirectory = join(fixture.cwd, "src", "components");
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README");
      writeFixtureFile(join(fixture.cwd, "src", "README.md"), "# Src README");
      writeFixtureFile(join(componentsDirectory, "README.md"), "# Components README");
      writeFixtureFile(join(componentsDirectory, "button.ts"), "export const button = true;\n");

      const result = await invokeRead(fixture, "session-multi", { file_path: "src/components/button.ts" });
      const context = result.additionalContext ?? "";

      assert.equal(countMarkers(context, "[Project README:"), 3);
      assert.ok(context.indexOf("# Root README") < context.indexOf("# Src README"));
      assert.ok(context.indexOf("# Src README") < context.indexOf("# Components README"));
    });
  });

  it("does not re-inject already cached directories", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "README.md"), "# Source README");
      writeFixtureFile(join(fixture.cwd, "src", "a.ts"), "export const a = true;\n");
      writeFixtureFile(join(fixture.cwd, "src", "b.ts"), "export const b = true;\n");

      const first = await invokeRead(fixture, "session-cache", { file_path: "src/a.ts" });
      const second = await invokeRead(fixture, "session-cache", { file_path: "src/b.ts" });

      assert.equal(countMarkers(first.additionalContext ?? "", "[Project README:"), 1);
      assert.deepEqual(second, { hookId: HOOK_ID });
    });
  });

  it("shows truncation notice when content is truncated", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "README.md"), "# Truncated README\nabcdefghi");
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const file = true;\n");

      const result = await invokeRead(fixture, "session-truncated", { file_path: "src/file.ts" }, { content: "ok" }, 12);
      const context = result.additionalContext ?? "";

      assert.match(context, /# Truncated/);
      assert.match(
        context,
        /\[Note: Content was truncated to save context window space\. For full context, please read the file directly: src\/README\.md\]/
      );
    });
  });

  it("does nothing when filePath cannot be resolved", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README");

      const result = await invokeRead(fixture, "session-empty-path", { file_path: "" });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("uses tool_response.metadata.filePath fallback when tool input has no path", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "README.md"), "# Metadata README");
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const file = true;\n");

      const result = await invokeRead(fixture, "session-metadata", {}, { content: "ok", metadata: { filePath: "src/file.ts" } });

      assert.match(result.additionalContext ?? "", /# Metadata README/);
    });
  });

  it("PreCompact envelope deletes session state and allows reinjection on next PostToolUse Read", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "README.md"), "# Source README");
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const file = true;\n");
      const sessionId = "session-precompact";

      const first = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });
      const cleanup = await invokeLifecycle(fixture, "PreCompact", sessionId);
      const second = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });

      assert.match(first.additionalContext ?? "", /# Source README/);
      assert.deepEqual(cleanup, { hookId: HOOK_ID });
      assert.match(second.additionalContext ?? "", /# Source README/);
    });
  });

  it("SessionEnd envelope deletes session state", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "src", "README.md"), "# Source README");
      writeFixtureFile(join(fixture.cwd, "src", "file.ts"), "export const file = true;\n");
      const sessionId = "session-end";

      const first = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });
      const cleanup = await invokeLifecycle(fixture, "SessionEnd", sessionId);
      const second = await invokeRead(fixture, sessionId, { file_path: "src/file.ts" });

      assert.match(first.additionalContext ?? "", /# Source README/);
      assert.deepEqual(cleanup, { hookId: HOOK_ID });
      assert.match(second.additionalContext ?? "", /# Source README/);
    });
  });

  it("Missing sessionId on envelope returns { hookId } without injecting", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README");
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const file = true;\n");

      const result = await invokeRead(fixture, undefined, { file_path: "file.ts" });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("Missing pluginDataDir returns { hookId } without injecting", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README");
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const file = true;\n");
      const envelope = makePostToolEnvelope("Read", "session-no-data", fixture.cwd, { file_path: "file.ts" }, { content: "ok" });

      const result = await createDirectoryReadmeInjector()(envelope, resolveRuntimeContext(fixture.cwd, {}));

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("Failed tool response skips injection", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README");
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const file = true;\n");

      const result = await invokeRead(fixture, "session-failed", { file_path: "file.ts" }, { is_error: true });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("Missing tool response skips injection", async () => {
    await withDirectoryInjectorFixture(async (fixture) => {
      writeFixtureFile(join(fixture.cwd, "README.md"), "# Root README");
      writeFixtureFile(join(fixture.cwd, "file.ts"), "export const file = true;\n");
      const envelope = makePostToolEnvelope("Read", "session-missing-response", fixture.cwd, { file_path: "file.ts" }, undefined);
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir });

      const result = await createDirectoryReadmeInjector()(envelope, context);

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });
});

async function withDirectoryInjectorFixture(run: (fixture: DirectoryInjectorFixture) => Promise<void> | void): Promise<void> {
  const cwd = mkdtempSync(join(tmpdir(), "directory-readme-injector-cwd-"));
  const dataDir = mkdtempSync(join(tmpdir(), "directory-readme-injector-data-"));
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
  return createDirectoryReadmeInjector()(envelope, context);
}

async function invokeLifecycle(fixture: DirectoryInjectorFixture, eventName: "PreCompact" | "SessionEnd", sessionId: string) {
  const envelope = makeLifecycleEnvelope(eventName, sessionId, fixture.cwd);
  const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir });
  return createDirectoryReadmeInjector()(envelope, context);
}

function countMarkers(value: string, marker: string): number {
  return value.split(marker).length - 1;
}

function assertPrefixedCombinedContext(result: Awaited<ReturnType<typeof invokeRead>>, expectedPrefix: string): void {
  const output = combineHookResults("PostToolUse", [result]);
  assert.equal(output.hookSpecificOutput?.additionalContext?.startsWith(expectedPrefix), true);
}
