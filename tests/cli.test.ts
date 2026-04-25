import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "..", "..");
const cliPath = resolve(repoRoot, "dist", "src", "cli", "dispatch.js");

describe("CLI dispatch", () => {
  it("exits 0 with empty output for a valid UserPromptSubmit payload and empty registry", async () => {
    const result = await runCli("UserPromptSubmit", {
      hook_event_name: "UserPromptSubmit",
      session_id: "session-1",
      cwd: repoRoot,
      user_prompt: "Add tests"
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  });

  it("exits nonzero and reports cwd validation errors when cwd is missing", async () => {
    const result = await runCli("UserPromptSubmit", {
      hook_event_name: "UserPromptSubmit",
      session_id: "session-1",
      user_prompt: "Add tests"
    });

    assert.notEqual(result.exitCode, 0);
    assert.match(result.stderr, /cwd must be a string/);
  });
});

interface CliResult {
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function runCli(eventName: string, input: Record<string, unknown>): Promise<CliResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cliPath, eventName], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolvePromise({ exitCode, stdout, stderr });
    });

    child.stdin.end(JSON.stringify(input));
  });
}
