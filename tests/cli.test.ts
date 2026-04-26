import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
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
const blockMessage = "File already exists. Use edit tool instead.";

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

  it("denies unsafe existing writes and lets disabled hook config bypass the guard", async () => {
    await withCliFixture(async ({ cwd, dataDir }) => {
      writeFixtureFile(join(cwd, "src", "a.ts"), "export const a = 1;\n");
      const input = {
        hook_event_name: "PreToolUse",
        session_id: "session-write",
        cwd,
        tool_name: "Write",
        tool_input: { file_path: "src/a.ts", content: "export const a = 2;\n" }
      };

      const blocked = await runCli("PreToolUse", input, { env: { CLAUDE_PLUGIN_DATA: dataDir } });
      const blockedOutput = parseCliOutput(blocked.stdout);
      const blockedHookOutput = readRecord(blockedOutput, "hookSpecificOutput");

      assert.equal(blocked.exitCode, 0);
      assert.equal(blocked.stderr, "");
      assert.equal(blockedHookOutput.hookEventName, "PreToolUse");
      assert.equal(blockedHookOutput.permissionDecision, "deny");
      assert.equal(blockedHookOutput.permissionDecisionReason, blockMessage);

      writeFixtureFile(join(cwd, ".claude", "hook-pack.local.md"), "---\ndisabled_hooks: write-existing-file-guard\n---\n");
      const bypassed = await runCli("PreToolUse", input, { env: { CLAUDE_PLUGIN_DATA: dataDir } });

      assert.equal(bypassed.exitCode, 0);
      assert.equal(bypassed.stdout, "");
      assert.equal(bypassed.stderr, "");
    });
  });

  it("reinjects directory and rule context after lifecycle cleanup", async () => {
    await withCliFixture(async ({ cwd, dataDir }) => {
      writeFixtureFile(join(cwd, "package.json"), "{}\n");
      writeFixtureFile(join(cwd, "README.md"), "Read project context.\n");
      writeFixtureFile(join(cwd, "src", "AGENTS.md"), "Use exact types.\n");
      writeFixtureFile(join(cwd, "src", "a.ts"), "export const a = 1;\n");
      writeFixtureFile(join(cwd, ".claude", "rules", "typescript.md"), "---\napplyTo: src/**/*.ts\n---\nUse project rule.\n");
      const readInput = {
        hook_event_name: "PostToolUse",
        session_id: "session-context",
        cwd,
        tool_name: "Read",
        tool_input: { file_path: "src/a.ts" },
        tool_response: { content: "read ok" }
      };

      const first = await runCli("PostToolUse", readInput, { env: { CLAUDE_PLUGIN_DATA: dataDir } });
      assertCliContext(first, [
        "directory-agents-injector: [Directory Context: src/AGENTS.md]",
        "Use exact types.",
        "directory-readme-injector: [Project README: README.md]",
        "Read project context.",
        "rules-injector: [Rule: .claude/rules/typescript.md]",
        "Use project rule."
      ]);

      const cleanup = await runCli("PreCompact", {
        hook_event_name: "PreCompact",
        session_id: "session-context",
        cwd
      }, { env: { CLAUDE_PLUGIN_DATA: dataDir } });
      assert.equal(cleanup.exitCode, 0);
      assert.equal(cleanup.stdout, "");
      assert.equal(cleanup.stderr, "");

      const afterCleanup = await runCli("PostToolUse", readInput, { env: { CLAUDE_PLUGIN_DATA: dataDir } });
      assertCliContext(afterCleanup, [
        "directory-agents-injector: [Directory Context: src/AGENTS.md]",
        "directory-readme-injector: [Project README: README.md]",
        "rules-injector: [Rule: .claude/rules/typescript.md]"
      ]);
    });
  });

  it("blocks continuation when the comment checker command reports findings", async () => {
    await withCliFixture(async ({ cwd, dataDir }) => {
      const checkerPath = join(cwd, "fake-comment-checker.js");
      writeFixtureFile(checkerPath, "#!/usr/bin/env node\nprocess.stdin.resume();\nprocess.stderr.write('Unnecessary comment detected\\n');\nprocess.exit(2);\n");
      chmodSync(checkerPath, 0o755);
      const env = { CLAUDE_PLUGIN_DATA: dataDir, COMMENT_CHECKER_COMMAND: checkerPath };
      const preInput = {
        hook_event_name: "PreToolUse",
        session_id: "session-comment",
        cwd,
        tool_name: "Write",
        tool_input: { file_path: "src/new.ts", content: "// obvious\nexport const a = 1;\n" },
        tool_use_id: "comment-call"
      };

      const pre = await runCli("PreToolUse", preInput, { env });
      assert.equal(pre.exitCode, 0);
      assert.equal(pre.stderr, "");

      const post = await runCli("PostToolUse", {
        ...preInput,
        hook_event_name: "PostToolUse",
        tool_response: { content: "write ok" }
      }, { env });
      const postOutput = parseCliOutput(post.stdout);

      assert.equal(post.exitCode, 0);
      assert.equal(post.stderr, "");
      assert.equal(postOutput.decision, "block");
      assert.equal(postOutput.reason, "Unnecessary comment detected");
    });
  });

  it("includes user rules only when include_user_rules is enabled", async () => {
    await withCliFixture(async ({ cwd, dataDir, homeDir }) => {
      writeFixtureFile(join(cwd, "package.json"), "{}\n");
      writeFixtureFile(join(cwd, "src", "a.ts"), "export const a = 1;\n");
      writeFixtureFile(join(homeDir, ".claude", "rules", "global.md"), "---\nalwaysApply: true\n---\nUser home rule.\n");
      const readInput = {
        hook_event_name: "PostToolUse",
        cwd,
        tool_name: "Read",
        tool_input: { file_path: "src/a.ts" },
        tool_response: { content: "read ok" }
      };

      const excluded = await runCli("PostToolUse", { ...readInput, session_id: "session-user-false" }, {
        env: { CLAUDE_PLUGIN_DATA: dataDir, HOME: homeDir }
      });
      assert.equal(excluded.exitCode, 0);
      assert.equal(excluded.stdout, "");
      assert.equal(excluded.stderr, "");

      const included = await runCli("PostToolUse", { ...readInput, session_id: "session-user-true" }, {
        env: { CLAUDE_PLUGIN_DATA: dataDir, HOME: homeDir, CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES: "true" }
      });

      assertCliContext(included, ["rules-injector: [Rule: ~/.claude/rules/global.md]", "User home rule."]);
    });
  });

  it("fails open when the comment checker dependency hangs inside its hook budget", async () => {
    await withCliFixture(async ({ cwd, dataDir }) => {
      const checkerPath = join(cwd, "hung-comment-checker.js");
      writeFixtureFile(checkerPath, "#!/usr/bin/env node\nprocess.stdin.resume();\nsetInterval(() => {}, 1000);\n");
      chmodSync(checkerPath, 0o755);
      const env = { CLAUDE_PLUGIN_DATA: dataDir, COMMENT_CHECKER_COMMAND: checkerPath };
      const preInput = {
        hook_event_name: "PreToolUse",
        session_id: "session-hung",
        cwd,
        tool_name: "Write",
        tool_input: { file_path: "src/hung.ts", content: "export const a = 1;\n" },
        tool_use_id: "hung-call"
      };

      await runCli("PreToolUse", preInput, { env });
      const startedAt = Date.now();
      const post = await runCli("PostToolUse", {
        ...preInput,
        hook_event_name: "PostToolUse",
        tool_response: { content: "write ok" }
      }, { env });

      assert.equal(post.exitCode, 0);
      assert.equal(post.stdout, "");
      assert.equal(post.stderr, "");
      assert.ok(Date.now() - startedAt < 7800);
    });
  });

  it("emits only allow, deny, or ask PreToolUse permissions from Tier 1 hooks", async () => {
    await withCliFixture(async ({ cwd, dataDir }) => {
      writeFixtureFile(join(cwd, "src", "a.ts"), "export const a = 1;\n");
      const baseInput = {
        hook_event_name: "PreToolUse",
        session_id: "session-permissions",
        cwd,
        tool_name: "Write"
      };

      const denied = await runCli("PreToolUse", {
        ...baseInput,
        tool_input: { file_path: "src/a.ts", content: "export const a = 2;\n" }
      }, { env: { CLAUDE_PLUGIN_DATA: dataDir } });
      assertTier1Permission(denied, "deny");

      const allowed = await runCli("PreToolUse", {
        ...baseInput,
        tool_input: { file_path: "src/a.ts", content: "export const a = 3;\n", overwrite: true }
      }, { env: { CLAUDE_PLUGIN_DATA: dataDir } });
      assertTier1Permission(allowed, "allow");
    });
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
      /permissionDecision must be allow, ask, or deny/
    );
  });

  it("rejects command registry output that tries to emit defer permission", async () => {
    await assert.rejects(
      executeRegistryEntry({
        entry: makeEntry({ kind: "command", command: [process.execPath, "hook.js"] }),
        envelope: makeEnvelope("PreToolUse"),
        runtimeContext: resolveRuntimeContext(repoRoot, {}),
        resolveBuiltInHookHandler: () => undefined,
        runCommand: async () => ({
          exitCode: 0,
          stdout: JSON.stringify({ hookId: "command-hook", permissionDecision: "defer", message: "legacy defer" }),
          stderr: "",
          timedOut: false
        })
      }),
      /permissionDecision must be allow, ask, or deny/
    );
  });
});

interface CliResult {
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

interface CliFixture {
  readonly cwd: string;
  readonly dataDir: string;
  readonly homeDir: string;
}

interface CliRunOptions {
  readonly env?: Readonly<Record<string, string | undefined>> | undefined;
}

async function withCliFixture(run: (fixture: CliFixture) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "hook-pack-cli-"));
  const cwd = join(root, "workspace");
  const dataDir = join(root, "plugin-data");
  const homeDir = join(root, "home");
  mkdirSync(join(cwd, "src"), { recursive: true });
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(homeDir, { recursive: true });
  try {
    await run({ cwd, dataDir, homeDir });
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

function writeFixtureFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function runCli(eventName: string, input: Record<string, unknown>, options: CliRunOptions = {}): Promise<CliResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cliPath, eventName], {
      env: { ...process.env, ...options.env },
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

function assertCliContext(result: CliResult, expectedFragments: readonly string[]): void {
  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, "");
  const output = parseCliOutput(result.stdout);
  const hookOutput = readRecord(output, "hookSpecificOutput");
  assert.equal(hookOutput.hookEventName, "PostToolUse");
  const additionalContext = readString(hookOutput, "additionalContext");
  for (const fragment of expectedFragments) {
    assert.match(additionalContext, new RegExp(escapeRegExp(fragment)));
  }
}

function assertTier1Permission(result: CliResult, expected: "allow" | "deny" | "ask"): void {
  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, "");
  const output = parseCliOutput(result.stdout);
  const hookOutput = readRecord(output, "hookSpecificOutput");
  const permissionDecision = hookOutput.permissionDecision;
  assert.ok(permissionDecision === "allow" || permissionDecision === "deny" || permissionDecision === "ask");
  assert.equal(permissionDecision, expected);
}

function parseCliOutput(stdout: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(stdout);
  assert.equal(typeof parsed, "object");
  assert.notEqual(parsed, null);
  assert.equal(Array.isArray(parsed), false);
  return parsed as Record<string, unknown>;
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = record[key];
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);
  assert.equal(Array.isArray(value), false);
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    assert.fail(`${key} must be a string`);
  }
  return value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
