// Native Claude Code adaptations:
// - native HookEnvelope + HookRuntimeContext handler factory
// - PostToolUse findings block continuation with stopDecision instead of mutating completed tool output
// - in-memory pending calls become plugin-data state
// - in-process initialization/runner lock is not ported because hook invocations are separate Node processes
// - downloader/binary failures fail open within a hook-owned budget
// - patch-tool behavior consulted but dropped as non-portable per docs/architecture/comment-checker-apply-patch-verification.md

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { combineHookResults } from "../../src/core/output.js";
import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createCommentChecker, type CommentCheckerRunInput, type CommentCheckerRunResult } from "../../src/hooks/comment-checker/index.js";
import { makeLifecycleEnvelope, makePostToolEnvelope, makePreToolEnvelope } from "../helpers/hook-fixtures.js";

const HOOK_ID = "comment-checker";

describe("comment-checker hook", () => {
  it("blocks continuation when checker finds comments after successful write", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const checker = createCommentChecker({
        runChecker: async () => ({ hasComments: true, message: "Unnecessary comment detected" }),
        now: () => 1_000
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      assert.deepEqual(await checker(makePreToolEnvelope("Write", "session-1", fixture.cwd, { file_path: "src/a.ts", content: "// obvious\nconst a = 1;" }, { tool_use_id: "call-1" }), context), {
        hookId: HOOK_ID
      });

      const post = await checker(makePostToolEnvelope("Write", "session-1", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "call-1" }), context);
      assert.equal(post.hookId, HOOK_ID);
      assert.equal(post.stopDecision, "block");
      assert.match(post.message ?? "", /Unnecessary comment detected/);
      assert.deepEqual(combineHookResults("PostToolUse", [post]), {
        decision: "block",
        reason: "Unnecessary comment detected",
        systemMessage: "comment-checker: Unnecessary comment detected"
      });
    });
  });

  it("returns hookId when checker reports clean output", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const checker = createCommentChecker({ runChecker: async () => ({ hasComments: false, message: "" }), now: () => 1_000 });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      await checker(makePreToolEnvelope("Write", "session-clean", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "call-clean" }), context);

      assert.deepEqual(await checker(makePostToolEnvelope("Write", "session-clean", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "call-clean" }), context), {
        hookId: HOOK_ID
      });
    });
  });

  it("derives Edit and MultiEdit checker input from final file contents", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const inputs: CommentCheckerRunInput[] = [];
      const checker = createCommentChecker({
        runChecker: async (input: CommentCheckerRunInput) => {
          inputs.push(input);
          return { hasComments: false, message: "" };
        },
        now: () => 1_000
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      await checker(makePreToolEnvelope("Edit", "session-edit", fixture.cwd, { file_path: "src/a.ts", old_string: "RAW_EDIT_OLD", new_string: "RAW_EDIT_NEW" }, { tool_use_id: "edit-call" }), context);
      writeFixtureFile(join(fixture.cwd, "src", "a.ts"), "// final edit content\nconst a = 2;\n");
      await checker(makePostToolEnvelope("Edit", "session-edit", fixture.cwd, { file_path: "src/a.ts" }, { content: "edit ok" }, { tool_use_id: "edit-call" }), context);

      await checker(makePreToolEnvelope("MultiEdit", "session-edit", fixture.cwd, { file_path: "src/a.ts", edits: [{ old_string: "RAW_MULTI_OLD", new_string: "RAW_MULTI_NEW" }] }, { tool_use_id: "multi-call" }), context);
      writeFixtureFile(join(fixture.cwd, "src", "a.ts"), "// final multiedit content\nconst a = 3;\n");
      await checker(makePostToolEnvelope("MultiEdit", "session-edit", fixture.cwd, { file_path: "src/a.ts" }, { content: "edit ok" }, { tool_use_id: "multi-call" }), context);

      assert.deepEqual(inputs.map((input) => input.toolName), ["edit", "multiedit"]);
      assert.equal(inputs[0]?.content, "// final edit content\nconst a = 2;\n");
      assert.equal(inputs[0]?.oldString, undefined);
      assert.equal(inputs[0]?.newString, undefined);
      assert.equal(inputs[0]?.edits, undefined);
      assert.equal(inputs[1]?.content, "// final multiedit content\nconst a = 3;\n");
      assert.equal(inputs[1]?.oldString, undefined);
      assert.equal(inputs[1]?.newString, undefined);
      assert.equal(inputs[1]?.edits, undefined);
    });
  });

  it("uses fallback key when no runtime tool-call ID exists", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const checker = createCommentChecker({
        runChecker: async () => ({ hasComments: true, message: "fallback finding" }),
        now: () => 1_000
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);
      const input = { file_path: "src/a.ts", content: "// obvious\nconst a = 1;" };

      await checker(makePreToolEnvelope("Write", "session-fallback", fixture.cwd, input), context);
      const post = await checker(makePostToolEnvelope("Write", "session-fallback", fixture.cwd, input, { content: "write ok" }), context);

      assert.equal(post.stopDecision, "block");
      assert.equal(post.message, "fallback finding");
    });
  });

  it("failed tool responses skip checker invocation and fail open", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      let checkerCalls = 0;
      const checker = createCommentChecker({
        runChecker: async () => {
          checkerCalls += 1;
          return { hasComments: true, message: "should not run" };
        },
        now: () => 1_000
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      await checker(makePreToolEnvelope("Write", "session-failed", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "call-failed" }), context);
      const post = await checker(makePostToolEnvelope("Write", "session-failed", fixture.cwd, { file_path: "src/a.ts" }, { is_error: true }, { tool_use_id: "call-failed" }), context);

      assert.deepEqual(post, { hookId: HOOK_ID });
      assert.equal(checkerCalls, 0);
    });
  });

  it("missing plugin data, missing session, missing path, and outside-cwd paths fail open", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const checker = createCommentChecker({ runChecker: async () => ({ hasComments: true, message: "should not block" }), now: () => 1_000 });
      const missingDataContext = resolveRuntimeContext(fixture.cwd, {}, () => 1_000);
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      assert.deepEqual(await checker(makePreToolEnvelope("Write", "session-no-data", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "no-data" }), missingDataContext), { hookId: HOOK_ID });
      assert.deepEqual(await checker(makePreToolEnvelope("Write", undefined, fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "no-session" }), context), { hookId: HOOK_ID });
      assert.deepEqual(await checker(makePreToolEnvelope("Write", "session-no-path", fixture.cwd, { content: "const a = 1;" }, { tool_use_id: "no-path" }), context), { hookId: HOOK_ID });
      assert.deepEqual(await checker(makePreToolEnvelope("Write", "session-outside", fixture.cwd, { file_path: join(fixture.outsideDir, "a.ts"), content: "const a = 1;" }, { tool_use_id: "outside" }), context), { hookId: HOOK_ID });
    });
  });

  it("omits apply_patch tool variants and ignores PostToolUse metadata files", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      let checkerCalls = 0;
      const checker = createCommentChecker({
        runChecker: async () => {
          checkerCalls += 1;
          return { hasComments: true, message: "should not run" };
        },
        now: () => 1_000
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      for (const toolName of ["apply_patch", "ApplyPatch"]) {
        const raw = { tool_use_id: `${toolName}-call` };
        const toolInput = { patch: "*** Begin Patch\n*** Update File: src/a.ts\n@@\n-const a = 1;\n+// obvious\n+const a = 1;\n*** End Patch" };
        const toolResponse = {
          content: "patch ok",
          metadata: {
            files: [
              {
                path: join(fixture.cwd, "src", "a.ts"),
                before: "const a = 1;\n",
                after: "// obvious\nconst a = 1;\n"
              }
            ]
          }
        };

        assert.deepEqual(await checker(makePreToolEnvelope(toolName, "session-patch", fixture.cwd, toolInput, raw), context), { hookId: HOOK_ID });
        assert.deepEqual(await checker(makePostToolEnvelope(toolName, "session-patch", fixture.cwd, toolInput, toolResponse, raw), context), { hookId: HOOK_ID });
      }

      assert.equal(checkerCalls, 0);
      assert.equal(countFiles(join(fixture.dataDir, "comment-checker", "pending")), 0);
    });
  });

  it("state write failure fails open and leaves no pending call to block later", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const dataFile = join(fixture.outsideDir, "plugin-data-file");
      writeFixtureFile(dataFile, "not a directory");
      let checkerCalls = 0;
      const checker = createCommentChecker({
        runChecker: async () => {
          checkerCalls += 1;
          return { hasComments: true, message: "should not block" };
        },
        now: () => 1_000
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: dataFile }, () => 1_000);

      assert.deepEqual(await checker(makePreToolEnvelope("Write", "session-state-failure", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "state-failure" }), context), { hookId: HOOK_ID });
      assert.deepEqual(await checker(makePostToolEnvelope("Write", "session-state-failure", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "state-failure" }), context), { hookId: HOOK_ID });
      assert.equal(checkerCalls, 0);
    });
  });

  it("lifecycle cleanup deletes pending calls for the session", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const checker = createCommentChecker({ runChecker: async () => ({ hasComments: true, message: "should not run" }), now: () => 1_000 });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);

      await checker(makePreToolEnvelope("Write", "session-cleanup", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "cleanup-call" }), context);
      assert.deepEqual(await checker(makeLifecycleEnvelope("PreCompact", "session-cleanup", fixture.cwd), context), { hookId: HOOK_ID });
      assert.deepEqual(await checker(makePostToolEnvelope("Write", "session-cleanup", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "cleanup-call" }), context), { hookId: HOOK_ID });

      await checker(makePreToolEnvelope("Write", "session-end", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "end-call" }), context);
      assert.deepEqual(await checker(makeLifecycleEnvelope("SessionEnd", "session-end", fixture.cwd), context), { hookId: HOOK_ID });
      assert.deepEqual(await checker(makePostToolEnvelope("Write", "session-end", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "end-call" }), context), { hookId: HOOK_ID });
    });
  });

  it("lifecycle cleanup removes stale download locks", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const checker = createCommentChecker({ runChecker: async () => ({ hasComments: true, message: "should not run" }), now: () => 100_000 });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 100_000);

      for (const eventName of ["PreCompact", "SessionEnd"] as const) {
        const lockDir = join(fixture.dataDir, "comment-checker", "locks", "download.lock");
        mkdirSync(lockDir, { recursive: true });
        writeFixtureFile(join(lockDir, "owner.json"), `${JSON.stringify({ pid: 1, createdAt: 1_000, token: "stale" })}\n`);

        assert.deepEqual(await checker(makeLifecycleEnvelope(eventName, "session-lock-cleanup", fixture.cwd), context), { hookId: HOOK_ID });
        assert.equal(existsSync(lockDir), false, `${eventName} should remove stale download lock`);
      }
    });
  });

  it("unavailable checker and hook-owned budget timeout fail open", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const unavailable = await runPrePost(fixture, async () => ({ hasComments: false, message: "", unavailable: true }));
      assert.deepEqual(unavailable, { hookId: HOOK_ID });

      const timeoutChecker = createCommentChecker({
        runChecker: () => new Promise<CommentCheckerRunResult>(() => {}),
        now: () => 1_000,
        budgetMs: 25
      });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);
      await timeoutChecker(makePreToolEnvelope("Write", "session-timeout", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "timeout-call" }), context);

      const startedAt = Date.now();
      const result = await timeoutChecker(makePostToolEnvelope("Write", "session-timeout", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "timeout-call" }), context);

      assert.deepEqual(result, { hookId: HOOK_ID });
      assert.ok(Date.now() - startedAt < 1_000);
    });
  });

  it("hook-owned budget waits for SIGKILL cleanup before fail-open", async () => {
    await withCommentCheckerFixture(async (fixture) => {
      const pidPath = join(fixture.cwd, "checker.pid");
      const termPath = join(fixture.cwd, "checker.term");
      const checkerPath = join(fixture.cwd, "checker-ignores-term.js");
      writeFixtureFile(checkerPath, `#!/usr/bin/env node\nconst fs = require('node:fs');\nfs.writeFileSync(${JSON.stringify(pidPath)}, String(process.pid));\nprocess.on('SIGTERM', () => { fs.writeFileSync(${JSON.stringify(termPath)}, 'term'); });\nsetInterval(() => {}, 1000);\n`);
      chmodSync(checkerPath, 0o755);
      const checker = createCommentChecker({ now: () => 1_000, budgetMs: 1_000 });
      const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir, COMMENT_CHECKER_COMMAND: checkerPath }, () => 1_000);
      await checker(makePreToolEnvelope("Write", "session-cleanup-budget", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "cleanup-budget-call" }), context);

      const startedAt = Date.now();
      const result = await checker(makePostToolEnvelope("Write", "session-cleanup-budget", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "cleanup-budget-call" }), context);

      assert.deepEqual(result, { hookId: HOOK_ID });
      assert.equal(existsSync(termPath), true);
      assert.ok(Date.now() - startedAt < 2_000);
      const pid = Number(readFileSync(pidPath, "utf8"));
      await waitUntilProcessGone(pid, 500);
    });
  });
});

interface CommentCheckerFixture {
  readonly cwd: string;
  readonly dataDir: string;
  readonly outsideDir: string;
}

async function withCommentCheckerFixture(run: (fixture: CommentCheckerFixture) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "comment-checker-hook-"));
  const cwd = join(root, "workspace");
  const dataDir = join(root, "plugin-data");
  const outsideDir = join(root, "outside");
  mkdirSync(join(cwd, "src"), { recursive: true });
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(outsideDir, { recursive: true });
  writeFixtureFile(join(cwd, "src", "a.ts"), "const a = 1;\n");
  try {
    await run({ cwd, dataDir, outsideDir });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function runPrePost(fixture: CommentCheckerFixture, runChecker: (input: CommentCheckerRunInput) => Promise<CommentCheckerRunResult>) {
  const checker = createCommentChecker({ runChecker, now: () => 1_000 });
  const context = resolveRuntimeContext(fixture.cwd, { CLAUDE_PLUGIN_DATA: fixture.dataDir }, () => 1_000);
  await checker(makePreToolEnvelope("Write", "session-run", fixture.cwd, { file_path: "src/a.ts", content: "const a = 1;" }, { tool_use_id: "run-call" }), context);
  return checker(makePostToolEnvelope("Write", "session-run", fixture.cwd, { file_path: "src/a.ts" }, { content: "write ok" }, { tool_use_id: "run-call" }), context);
}

function writeFixtureFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function countFiles(path: string): number {
  if (!existsSync(path)) {
    return 0;
  }
  return readdirSync(path, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).length;
}

async function waitUntilProcessGone(pid: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isProcessAlive(pid)) {
      return;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 25);
    });
  }
  try {
    process.kill(pid, "SIGKILL");
  } catch {
    // Process already gone.
  }
  assert.fail(`process ${pid} survived hook cleanup budget`);
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
