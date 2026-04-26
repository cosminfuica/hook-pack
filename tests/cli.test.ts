import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import type { CommandRunRequest, CommandRunResult } from "../src/core/command-runner.js";
import { executeRegistryEntry, MAX_COMMAND_OUTPUT_BYTES } from "../src/core/entry-runner.js";
import type { HookEnvelope } from "../src/core/events.js";
import { resolveRuntimeContext } from "../src/core/runtime-context.js";
import type { RegistryEntry } from "../src/core/registry.js";

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

  it("executes internal registry handlers with the normalized envelope and runtime context", async () => {
    const envelope = makeEnvelope("PreToolUse");
    const runtimeContext = resolveRuntimeContext(repoRoot, { CLAUDE_PLUGIN_DATA: "/plugin-data" });
    const entry = makeEntry({ kind: "internal", handlerId: "test-handler" });

    const result = await executeRegistryEntry({
      entry,
      envelope,
      runtimeContext,
      resolveBuiltInHookHandler: (handlerId) => {
        assert.equal(handlerId, "test-handler");
        return (receivedEnvelope, receivedContext) => {
          assert.equal(receivedEnvelope, envelope);
          assert.equal(receivedContext, runtimeContext);
          return { hookId: entry.id, permissionDecision: "allow", message: "safe" };
        };
      }
    });

    assert.deepEqual(result, { hookId: "test-hook", permissionDecision: "allow", message: "safe" });
  });

  it("rejects missing internal registry handlers", async () => {
    await assert.rejects(
      executeRegistryEntry({
        entry: makeEntry({ kind: "internal", handlerId: "missing-handler" }),
        envelope: makeEnvelope("PreToolUse"),
        runtimeContext: resolveRuntimeContext(repoRoot, {}),
        resolveBuiltInHookHandler: () => undefined
      }),
      /missing built-in hook handler: missing-handler/
    );
  });

  it("runs command registry entries and parses JSON hook results", async () => {
    const envelope = makeEnvelope("PreToolUse");
    const entry = makeEntry({ kind: "command", command: [process.execPath, "hook.js"] });
    const commandRunner = async (request: CommandRunRequest): Promise<CommandRunResult> => {
      assert.deepEqual(request.command, [process.execPath, "hook.js"]);
      assert.equal(request.cwd, repoRoot);
      assert.equal(request.input, JSON.stringify(envelope.raw));
      assert.equal(request.timeoutMs, entry.timeoutMs);
      assert.equal(request.maxOutputBytes, MAX_COMMAND_OUTPUT_BYTES);
      return {
        exitCode: 0,
        stdout: JSON.stringify({ hookId: "command-hook", permissionDecision: "deny", message: "blocked" }),
        stderr: "",
        timedOut: false
      };
    };

    const result = await executeRegistryEntry({
      entry,
      envelope,
      runtimeContext: resolveRuntimeContext(repoRoot, {}),
      resolveBuiltInHookHandler: () => undefined,
      runCommand: commandRunner
    });

    assert.deepEqual(result, { hookId: "command-hook", permissionDecision: "deny", message: "blocked" });
  });

  it("rejects nonzero command registry entries with stderr", async () => {
    await assert.rejects(
      executeRegistryEntry({
        entry: makeEntry({ kind: "command", command: [process.execPath, "hook.js"] }),
        envelope: makeEnvelope("PreToolUse"),
        runtimeContext: resolveRuntimeContext(repoRoot, {}),
        resolveBuiltInHookHandler: () => undefined,
        runCommand: async () => ({ exitCode: 2, stdout: "", stderr: "command failed", timedOut: false })
      }),
      /command failed/
    );
  });

  it("rejects command registry output at the 64KB cap", async () => {
    await assert.rejects(
      executeRegistryEntry({
        entry: makeEntry({ kind: "command", command: [process.execPath, "hook.js"] }),
        envelope: makeEnvelope("PreToolUse"),
        runtimeContext: resolveRuntimeContext(repoRoot, {}),
        resolveBuiltInHookHandler: () => undefined,
        runCommand: async () => ({
          exitCode: 0,
          stdout: "x".repeat(MAX_COMMAND_OUTPUT_BYTES),
          stderr: "",
          timedOut: false
        })
      }),
      /command output exceeded 65536 bytes/
    );
  });

  it("rejects malformed command hook result fields", async () => {
    await assert.rejects(
      executeRegistryEntry({
        entry: makeEntry({ kind: "command", command: [process.execPath, "hook.js"] }),
        envelope: makeEnvelope("PreToolUse"),
        runtimeContext: resolveRuntimeContext(repoRoot, {}),
        resolveBuiltInHookHandler: () => undefined,
        runCommand: async () => ({
          exitCode: 0,
          stdout: JSON.stringify({ hookId: "command-hook", permissionDecision: "maybe" }),
          stderr: "",
          timedOut: false
        })
      }),
      /permissionDecision must be allow, ask, deny, or defer/
    );
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

function makeEnvelope(eventName: HookEnvelope["eventName"]): HookEnvelope {
  const raw = {
    hook_event_name: eventName,
    session_id: "session-1",
    cwd: repoRoot,
    tool_name: "Write",
    tool_input: { file_path: "README.md" }
  };

  return {
    eventName,
    sessionId: "session-1",
    cwd: repoRoot,
    raw,
    toolName: "Write",
    toolInput: raw.tool_input,
    toolResponse: undefined,
    userPrompt: undefined
  };
}

function makeEntry(runner: RegistryEntry["runner"]): RegistryEntry {
  return {
    id: "test-hook",
    events: ["PreToolUse"],
    runner,
    timeoutMs: 1_000,
    defaultEnabled: true
  };
}
