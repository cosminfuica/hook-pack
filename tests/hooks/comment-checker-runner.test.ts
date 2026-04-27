// Native Claude Code adaptations:
// - bun.spawn assertions -> child_process.spawn runner assertions
// - checker command receives JSON on stdin and `check` argv
// - exit code mapping preserved: 0 clean, 2 finding, other/error/missing/timeout unavailable
// - runner timeout adapted to hook-owned budget below registry timeout

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { runCommentCheckerCommand, type CommentCheckerRunInput } from "../../src/hooks/comment-checker/runner.js";

describe("comment-checker runner", () => {
  it("maps exit 0 to a clean result and sends hook JSON to stdin", async () => {
    await withRunnerFixture(async (fixture) => {
      const stdinPath = join(fixture.dir, "stdin.json");
      const checker = writeExecutable(fixture.dir, "checker-clean.sh", `#!/usr/bin/env bash\ncat > "${stdinPath}"\nprintf 'ignored stdout'\nexit 0\n`);

      const result = await runCommentCheckerCommand(checker, makeRunInput(fixture.dir), { timeoutMs: 1_000 });

      assert.deepEqual(result, { hasComments: false, message: "" });
      assert.deepEqual(JSON.parse(readFileSync(stdinPath, "utf8")), {
        session_id: "session-1",
        cwd: fixture.dir,
        hook_event_name: "PostToolUse",
        tool_name: "Write",
        tool_input: {
          file_path: join(fixture.dir, "src", "a.ts"),
          content: "const a = 1;"
        },
        transcript_path: ""
      });
    });
  });

  it("maps edit and multiedit payloads to Claude hook input shape", async () => {
    await withRunnerFixture(async (fixture) => {
      const editStdinPath = join(fixture.dir, "edit-stdin.json");
      const multiStdinPath = join(fixture.dir, "multi-stdin.json");
      const editChecker = writeExecutable(fixture.dir, "checker-edit.sh", `#!/usr/bin/env bash\ncat > "${editStdinPath}"\nexit 0\n`);
      const multiChecker = writeExecutable(fixture.dir, "checker-multiedit.sh", `#!/usr/bin/env bash\ncat > "${multiStdinPath}"\nexit 0\n`);

      await runCommentCheckerCommand(editChecker, { ...makeRunInput(fixture.dir), toolName: "edit", oldString: "old", newString: "new", content: undefined }, { timeoutMs: 1_000 });
      await runCommentCheckerCommand(multiChecker, { ...makeRunInput(fixture.dir), toolName: "multiedit", edits: [{ old_string: "left", new_string: "right" }], content: undefined }, { timeoutMs: 1_000 });

      assert.deepEqual(JSON.parse(readFileSync(editStdinPath, "utf8")).tool_input, {
        file_path: join(fixture.dir, "src", "a.ts"),
        old_string: "old",
        new_string: "new"
      });
      assert.equal(JSON.parse(readFileSync(editStdinPath, "utf8")).tool_name, "Edit");
      assert.deepEqual(JSON.parse(readFileSync(multiStdinPath, "utf8")).tool_input, {
        file_path: join(fixture.dir, "src", "a.ts"),
        edits: [{ old_string: "left", new_string: "right" }]
      });
      assert.equal(JSON.parse(readFileSync(multiStdinPath, "utf8")).tool_name, "MultiEdit");
    });
  });

  it("maps exit 2 to a finding using stderr as the message", async () => {
    await withRunnerFixture(async (fixture) => {
      const checker = writeExecutable(fixture.dir, "checker-finding.sh", "#!/usr/bin/env bash\nprintf 'Unnecessary comment detected' >&2\nexit 2\n");

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 1_000 });

      assert.deepEqual(result, { hasComments: true, message: "Unnecessary comment detected" });
    });
  });

  it("maps exit 2 with empty stderr to a default finding message", async () => {
    await withRunnerFixture(async (fixture) => {
      const checker = writeExecutable(fixture.dir, "checker-empty-finding.sh", "#!/usr/bin/env bash\ncat >/dev/null\nexit 2\n");

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 1_000 });

      assert.deepEqual(result, { hasComments: true, message: "Comment checker reported findings." });
    });
  });

  it("caps stderr used for finding messages", async () => {
    await withRunnerFixture(async (fixture) => {
      const checker = writeExecutable(fixture.dir, "checker-large-finding.js", "#!/usr/bin/env node\nprocess.stderr.write('x'.repeat(10_000));\nprocess.exit(2);\n");

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 1_000 });

      assert.equal(result.hasComments, true);
      assert.equal(result.message.length, 4_096);
      assert.equal(result.message, "x".repeat(4_096));
    });
  });

  it("does not inherit unrelated environment variables", async () => {
    await withRunnerFixture(async (fixture) => {
      const previousSecret = process.env.COMMENT_CHECKER_SECRET;
      process.env.COMMENT_CHECKER_SECRET = "leaked";
      try {
        const checker = writeExecutable(fixture.dir, "checker-env.sh", "#!/bin/sh\nif [ -n \"$COMMENT_CHECKER_SECRET\" ]; then\n  printf '%s' \"$COMMENT_CHECKER_SECRET\" >&2\n  exit 2\nfi\nexit 0\n");

        const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 1_000 });

        assert.deepEqual(result, { hasComments: false, message: "" });
      } finally {
        if (previousSecret === undefined) {
          delete process.env.COMMENT_CHECKER_SECRET;
        } else {
          process.env.COMMENT_CHECKER_SECRET = previousSecret;
        }
      }
    });
  });

  it("maps non-finding exits to unavailable fail-open result", async () => {
    await withRunnerFixture(async (fixture) => {
      const checker = writeExecutable(fixture.dir, "checker-error.sh", "#!/usr/bin/env bash\nprintf 'boom' >&2\nexit 3\n");

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 1_000 });

      assert.deepEqual(result, { hasComments: false, message: "", unavailable: true });
    });
  });

  it("maps missing command spawn errors to unavailable fail-open result", async () => {
    await withRunnerFixture(async (fixture) => {
      const missing = join(fixture.dir, "missing-checker");

      const result = await runCommentCheckerCommand(missing, makeRunInput(), { timeoutMs: 1_000 });

      assert.deepEqual(result, { hasComments: false, message: "", unavailable: true });
    });
  });

  it("terminates hung checker before the dispatcher timeout budget", async () => {
    await withRunnerFixture(async (fixture) => {
      const marker = join(fixture.dir, "started");
      const checker = writeExecutable(fixture.dir, "checker-hangs.sh", `#!/usr/bin/env bash\ntouch "${marker}"\nsleep 10\n`);
      const startedAt = Date.now();

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 50, killGraceMs: 25 });

      assert.deepEqual(result, { hasComments: false, message: "", unavailable: true });
      assert.equal(existsSync(marker), true);
      assert.ok(Date.now() - startedAt < 2_000);
    });
  });

  it("terminates checker when the hook-owned budget aborts", async () => {
    await withRunnerFixture(async (fixture) => {
      const controller = new AbortController();
      const checker = writeExecutable(fixture.dir, "checker-abort.sh", "#!/usr/bin/env bash\nsleep 10\n");
      const startedAt = Date.now();
      setTimeout(() => controller.abort(), 25).unref();

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 5_000, killGraceMs: 25, signal: controller.signal });

      assert.deepEqual(result, { hasComments: false, message: "", unavailable: true });
      assert.ok(Date.now() - startedAt < 1_000);
    });
  });

  it("sends SIGKILL after grace when checker ignores SIGTERM", async () => {
    await withRunnerFixture(async (fixture) => {
      const pidPath = join(fixture.dir, "pid");
      const termPath = join(fixture.dir, "term");
      const checker = writeExecutable(fixture.dir, "checker-ignores-term.js", `#!/usr/bin/env node\nconst fs = require('node:fs');\nfs.writeFileSync(${JSON.stringify(pidPath)}, String(process.pid));\nprocess.on('SIGTERM', () => { fs.writeFileSync(${JSON.stringify(termPath)}, 'term'); });\nsetInterval(() => {}, 1000);\n`);
      const startedAt = Date.now();

      const result = await runCommentCheckerCommand(checker, makeRunInput(), { timeoutMs: 100, killGraceMs: 50 });

      assert.deepEqual(result, { hasComments: false, message: "", unavailable: true });
      assert.equal(existsSync(termPath), true);
      assert.ok(Date.now() - startedAt < 1_000);
      const pid = Number(readFileSync(pidPath, "utf8"));
      await waitUntilProcessGone(pid, 500);
    });
  });
});

interface RunnerFixture {
  readonly dir: string;
}

async function withRunnerFixture(run: (fixture: RunnerFixture) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), "comment-checker-runner-"));
  try {
    await run({ dir });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function writeExecutable(dir: string, name: string, content: string): string {
  const path = join(dir, name);
  writeFileSync(path, content, "utf8");
  chmodSync(path, 0o755);
  return path;
}

function makeRunInput(dir = process.cwd()): CommentCheckerRunInput {
  return {
    sessionId: "session-1",
    cwd: dir,
    toolName: "write",
    filePath: join(dir, "src", "a.ts"),
    content: "const a = 1;"
  };
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
  assert.fail(`process ${pid} survived SIGKILL grace`);
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
