// Native Claude Code adaptations:
// - bun:test -> node:test/node:assert/strict
// - PluginInput fixture -> HookEnvelope + HookRuntimeContext
// - thrown block error -> structured HookExecutionResult deny message
// - in-memory read set -> file-backed atomic token store under CLAUDE_PLUGIN_DATA
// - orchestration-specific bypass cases removed; CLAUDE_PLUGIN_DATA bypass added
// - lifecycle cleanup mapped to PreCompact and SessionEnd
// - fingerprint, overwrite string, missing data dir, and session-cap cases added

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";

import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createWriteExistingFileGuard, MAX_TRACKED_PATHS_PER_SESSION } from "../../src/hooks/write-existing-file-guard/index.js";
import { makeLifecycleEnvelope, makePostToolEnvelope, makePreToolEnvelope } from "../helpers/hook-fixtures.js";

const BLOCK_MESSAGE = "File already exists. Use edit tool instead.";
const HOOK_ID = "write-existing-file-guard";

interface GuardFixture {
  readonly cwd: string;
  readonly dataDir: string;
}

describe("write-existing-file-guard", () => {
  it("#given non-existing file #when write executes #then allows", async () => {
    await withGuardFixture(async (fixture) => {
      const result = await invokeWrite(fixture, { filePath: join(fixture.cwd, "new-file.txt"), content: "new content" });

      assert.deepEqual(result, { hookId: HOOK_ID });
    });
  });

  it("#given existing file without read or overwrite #when write executes #then blocks", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "existing.txt");

      const result = await invokeWrite(fixture, { filePath: existingFile, content: "new content" });

      assert.deepEqual(result, { hookId: HOOK_ID, permissionDecision: "deny", message: BLOCK_MESSAGE });
      assert.equal(Object.hasOwn(result, "updatedInput"), false);
    });
  });

  it("#given same-session read #when write executes #then allows once and consumes permission", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "consume-once.txt");
      const sessionId = "ses_consume";

      await invokeRead(fixture, sessionId, { filePath: existingFile });

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "first overwrite" }, sessionId), {
        hookId: HOOK_ID,
        permissionDecision: "allow"
      });
      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "second overwrite" }, sessionId), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("#given same-session concurrent writes #when only one read permission exists #then allows only one write", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "concurrent-consume.txt");
      const sessionId = "ses_concurrent";
      await invokeRead(fixture, sessionId, { filePath: existingFile });

      const results = await Promise.all([
        invokeWrite(fixture, { filePath: existingFile, content: "first attempt" }, sessionId),
        invokeWrite(fixture, { filePath: existingFile, content: "second attempt" }, sessionId)
      ]);

      assert.equal(results.filter((result) => result.permissionDecision === "allow").length, 1);
      assert.equal(results.filter((result) => result.permissionDecision === "deny" && result.message === BLOCK_MESSAGE).length, 1);
    });
  });

  it("#given read in another session #when write executes #then blocks", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "cross-session.txt");
      await invokeRead(fixture, "ses_reader", { filePath: existingFile });

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "new content" }, "ses_writer"), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("#given overwrite true boolean #when write executes #then bypasses guard and strips overwrite", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "overwrite-boolean.txt");
      const originalInput = { filePath: existingFile, content: "new content", overwrite: true, extra: 1 };

      const result = await invokeWrite(fixture, originalInput);

      assert.deepEqual(result, {
        hookId: HOOK_ID,
        permissionDecision: "allow",
        updatedInput: { filePath: existingFile, content: "new content", extra: 1 }
      });
      assert.notEqual(result.updatedInput, originalInput);
      assert.equal(originalInput.overwrite, true);
    });
  });

  it("overwrite: \"true\" string allows + strips overwrite from updatedInput", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "overwrite-string.txt");

      const result = await invokeWrite(fixture, { filePath: existingFile, content: "new content", overwrite: "true" });

      assert.deepEqual(result, {
        hookId: HOOK_ID,
        permissionDecision: "allow",
        updatedInput: { filePath: existingFile, content: "new content" }
      });
    });
  });

  it("overwrite stripping returns full updatedInput clone with all original fields except overwrite", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "overwrite-clone.txt");
      const originalInput = {
        file_path: existingFile,
        content: "new content",
        overwrite: true,
        mode: "0644",
        metadata: { reason: "test" }
      };

      const result = await invokeWrite(fixture, originalInput);

      assert.deepEqual(result, {
        hookId: HOOK_ID,
        permissionDecision: "allow",
        updatedInput: {
          file_path: existingFile,
          content: "new content",
          mode: "0644",
          metadata: { reason: "test" }
        }
      });
      assert.notEqual(result.updatedInput, originalInput);
      assert.deepEqual(originalInput, {
        file_path: existingFile,
        content: "new content",
        overwrite: true,
        mode: "0644",
        metadata: { reason: "test" }
      });
    });
  });

  it("#given overwrite falsy values #when write executes #then does not bypass guard", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "overwrite-falsy.txt");

      for (const overwrite of [false, "false"] as const) {
        assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "new content", overwrite }), {
          hookId: HOOK_ID,
          permissionDecision: "deny",
          message: BLOCK_MESSAGE
        });
      }
    });
  });

  it("#given two sessions read same file #when one writes #then other session is invalidated", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "invalidate.txt");

      await invokeRead(fixture, "ses_a", { filePath: existingFile });
      await invokeRead(fixture, "ses_b", { filePath: existingFile });

      assert.equal((await invokeWrite(fixture, { filePath: existingFile, content: "updated by B" }, "ses_b")).permissionDecision, "allow");
      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "updated by A" }, "ses_a"), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("#given file under CLAUDE_PLUGIN_DATA #when write executes #then allows", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.dataDir, "state/guard.txt");

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "new state" }), {
        hookId: HOOK_ID,
        permissionDecision: "allow"
      });
    });
  });

  it("#given file arg variants #when read then write executes #then supports all variants", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "variants.txt");
      const variants: Array<"filePath" | "path" | "file_path"> = ["filePath", "path", "file_path"];

      for (const variant of variants) {
        const sessionId = `ses_${variant}`;
        await invokeRead(fixture, sessionId, { [variant]: existingFile });
        assert.equal((await invokeWrite(fixture, { [variant]: existingFile, content: `overwrite via ${variant}` }, sessionId)).permissionDecision, "allow");
      }
    });
  });

  it("#given tools without file path arg #when write and read execute #then ignores safely", async () => {
    await withGuardFixture(async (fixture) => {
      assert.deepEqual(await invokeWrite(fixture, { content: "no path" }), { hookId: HOOK_ID });
      assert.deepEqual(await invokeRead(fixture, "ses_default", {}), { hookId: HOOK_ID });
    });
  });

  it("#given non-read-write tool #when it executes #then does not grant write permission", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "ignored-tool.txt");
      const sessionId = "ses_ignored_tool";
      await invokePreTool(fixture, "Edit", { filePath: existingFile, oldString: "old", newString: "new" }, sessionId);

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "should block" }, sessionId), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("#given relative read and absolute write #when same session writes #then allows", async () => {
    await withGuardFixture(async (fixture) => {
      createFile(fixture.cwd, "relative-absolute.txt");
      const sessionId = "ses_relative_absolute";
      const relativePath = "relative-absolute.txt";
      const absolutePath = resolve(fixture.cwd, relativePath);

      await invokeRead(fixture, sessionId, { filePath: relativePath });

      assert.equal((await invokeWrite(fixture, { filePath: absolutePath, content: "updated" }, sessionId)).permissionDecision, "allow");
    });
  });

  it("#given existing file outside session directory #when write executes #then allows implicitly", async () => {
    await withGuardFixture(async (fixture) => {
      const outsideDir = mkdtempSync(join(tmpdir(), "write-existing-file-guard-outside-"));
      try {
        const outsideFile = createFile(outsideDir, "outside.txt");
        assert.deepEqual(await invokeWrite(fixture, { filePath: outsideFile, content: "allowed overwrite" }), { hookId: HOOK_ID });
      } finally {
        rmSync(outsideDir, { recursive: true, force: true });
      }
    });
  });

  it("SessionEnd deletes session token state", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "session-cleanup.txt");
      const sessionId = "ses_cleanup";

      await invokeRead(fixture, sessionId, { filePath: existingFile });
      await invokeLifecycle(fixture, "SessionEnd", sessionId);

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "after cleanup" }, sessionId), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("PreCompact deletes session token state", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "precompact-cleanup.txt");
      const sessionId = "ses_precompact";

      await invokeRead(fixture, sessionId, { filePath: existingFile });
      await invokeLifecycle(fixture, "PreCompact", sessionId);

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "after cleanup" }, sessionId), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("#given case-different read path #when writing canonical path #then follows platform behavior", async () => {
    await withGuardFixture(async (fixture) => {
      const canonicalFile = createFile(fixture.cwd, "CaseFile.txt");
      const lowerCasePath = join(fixture.cwd, "casefile.txt");
      const sessionId = "ses_case";
      const isCaseInsensitiveFs = isCaseInsensitiveFilesystem(fixture.cwd);

      await invokeRead(fixture, sessionId, { filePath: lowerCasePath });
      const writeResult = await invokeWrite(fixture, { filePath: canonicalFile, content: "updated" }, sessionId);

      assert.equal(writeResult.permissionDecision, isCaseInsensitiveFs ? "allow" : "deny");
    });
  });

  it("#given read via symlink #when write via real path #then allows overwrite", async () => {
    await withGuardFixture(async (fixture) => {
      const targetFile = createFile(fixture.cwd, "real/target.txt");
      const symlinkPath = join(fixture.cwd, "linked-target.txt");
      const sessionId = "ses_symlink";

      try {
        symlinkSync(targetFile, symlinkPath);
      } catch {
        return;
      }

      await invokeRead(fixture, sessionId, { filePath: symlinkPath });

      assert.equal((await invokeWrite(fixture, { filePath: targetFile, content: "updated via symlink read" }, sessionId)).permissionDecision, "allow");
    });
  });

  it("#given session reads beyond path cap #when writing oldest and newest #then only newest is authorized", async () => {
    await withGuardFixture(async (fixture) => {
      const sessionId = "ses_path_cap";
      const oldestFile = createFile(fixture.cwd, "path-cap/0.txt");
      let newestFile = oldestFile;

      await invokeRead(fixture, sessionId, { filePath: oldestFile }, 1_000);
      for (let index = 1; index <= MAX_TRACKED_PATHS_PER_SESSION; index += 1) {
        newestFile = createFile(fixture.cwd, `path-cap/${index}.txt`);
        await invokeRead(fixture, sessionId, { filePath: newestFile }, 1_000 + index);
      }

      assert.equal((await invokeWrite(fixture, { filePath: oldestFile, content: "stale write" }, sessionId)).permissionDecision, "deny");
      assert.equal((await invokeWrite(fixture, { filePath: newestFile, content: "fresh write" }, sessionId)).permissionDecision, "allow");
    });
  });

  it("Reference cap behavior: oldest sessions evicted after 256", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "session-cap.txt");
      await invokeRead(fixture, "oldest-session", { filePath: existingFile }, 1_000);

      for (let index = 0; index < 255; index += 1) {
        await invokeRead(fixture, `session-${index}`, { filePath: existingFile }, 1_001 + index);
      }
      await invokeRead(fixture, "overflow-session", { filePath: existingFile }, 2_000);

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "after eviction" }, "oldest-session", 2_001), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
      assert.equal((await invokeWrite(fixture, { filePath: existingFile, content: "overflow write" }, "overflow-session", 2_002)).permissionDecision, "allow");
    });
  });

  it("File changed after read (mtime mismatch) denies write with block message", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "changed-after-read.txt", "first");
      const sessionId = "ses_changed";

      await invokeRead(fixture, sessionId, { filePath: existingFile });
      writeFileSync(existingFile, "second and different size", "utf8");

      assert.deepEqual(await invokeWrite(fixture, { filePath: existingFile, content: "third" }, sessionId), {
        hookId: HOOK_ID,
        permissionDecision: "deny",
        message: BLOCK_MESSAGE
      });
    });
  });

  it("Missing pluginDataDir denies existing in-cwd writes with exact block message", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "missing-data-dir.txt");

      const result = await createWriteExistingFileGuard()(makePreToolEnvelope("Write", "ses_missing", fixture.cwd, { filePath: existingFile }), resolveRuntimeContext(fixture.cwd, {}));

      assert.deepEqual(result, { hookId: HOOK_ID, permissionDecision: "deny", message: BLOCK_MESSAGE });
    });
  });

  it("#given failed read #when same session writes #then does not grant permission", async () => {
    await withGuardFixture(async (fixture) => {
      const existingFile = createFile(fixture.cwd, "failed-read.txt");
      const sessionId = "ses_failed_read";

      await invokeRead(fixture, sessionId, { filePath: existingFile }, undefined, { error: "read failed" });

      assert.equal((await invokeWrite(fixture, { filePath: existingFile, content: "updated" }, sessionId)).permissionDecision, "deny");
    });
  });
});

async function withGuardFixture(run: (fixture: GuardFixture) => Promise<void> | void): Promise<void> {
  const cwd = mkdtempSync(join(tmpdir(), "write-existing-file-guard-cwd-"));
  const dataDir = mkdtempSync(join(tmpdir(), "write-existing-file-guard-data-"));
  try {
    await run({ cwd, dataDir });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
    rmSync(dataDir, { recursive: true, force: true });
  }
}

function createFile(root: string, relativePath: string, content = "existing content"): string {
  const absolutePath = join(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
  return absolutePath;
}

async function invokePreTool(
  fixture: GuardFixture,
  toolName: string,
  toolInput: Record<string, unknown>,
  sessionId = "ses_default",
  now = 1_000
) {
  return createWriteExistingFileGuard()(makePreToolEnvelope(toolName, sessionId, fixture.cwd, toolInput), resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => now));
}

async function invokeWrite(fixture: GuardFixture, toolInput: Record<string, unknown>, sessionId = "ses_default", now = 1_000) {
  return invokePreTool(fixture, "Write", toolInput, sessionId, now);
}

async function invokeRead(
  fixture: GuardFixture,
  sessionId: string,
  toolInput: Record<string, unknown>,
  now = 1_000,
  toolResponse: unknown = { content: "ok" }
) {
  return createWriteExistingFileGuard()(makePostToolEnvelope("Read", sessionId, fixture.cwd, toolInput, toolResponse), resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => now));
}

async function invokeLifecycle(fixture: GuardFixture, eventName: "PreCompact" | "SessionEnd", sessionId: string) {
  return createWriteExistingFileGuard()(makeLifecycleEnvelope(eventName, sessionId, fixture.cwd), resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }));
}

function isCaseInsensitiveFilesystem(directory: string): boolean {
  const probeName = `CaseProbe_${Date.now()}_A.txt`;
  const upperPath = join(directory, probeName);
  const lowerPath = join(directory, probeName.toLowerCase());

  writeFileSync(upperPath, "probe");
  try {
    return existsSync(lowerPath);
  } finally {
    rmSync(upperPath, { force: true });
  }
}
