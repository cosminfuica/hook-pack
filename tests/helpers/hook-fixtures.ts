import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

import type { HookEnvelope, SupportedEventName } from "../../src/core/events.js";

export interface HookFixture {
  readonly cwd: string;
  readonly dataDir: string;
  readonly srcDir: string;
}

export async function withHookFixture(run: (fixture: HookFixture) => Promise<void> | void): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "hook-pack-fixture-"));
  const cwd = join(root, "workspace");
  const dataDir = join(root, "plugin-data");
  const srcDir = join(cwd, "src");
  mkdirSync(srcDir, { recursive: true });
  mkdirSync(dataDir, { recursive: true });
  try {
    await run({ cwd, dataDir, srcDir });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

export function writeFixtureFile(path: string, content: string): void {
  writeFileSync(path, content, "utf8");
}

export function makePreToolEnvelope(
  toolName: string,
  sessionId: string | undefined,
  cwd: string,
  toolInput: Record<string, unknown>,
  rawExtra: Record<string, unknown> = {}
): HookEnvelope {
  return {
    eventName: "PreToolUse",
    sessionId,
    cwd,
    raw: { hook_event_name: "PreToolUse", cwd, session_id: sessionId, tool_name: toolName, tool_input: toolInput, ...rawExtra },
    toolName,
    toolInput,
    toolResponse: undefined,
    userPrompt: undefined
  };
}

export function makePostToolEnvelope(
  toolName: string,
  sessionId: string | undefined,
  cwd: string,
  toolInput: Record<string, unknown>,
  toolResponse: unknown,
  rawExtra: Record<string, unknown> = {}
): HookEnvelope {
  return {
    eventName: "PostToolUse",
    sessionId,
    cwd,
    raw: { hook_event_name: "PostToolUse", cwd, session_id: sessionId, tool_name: toolName, tool_input: toolInput, tool_response: toolResponse, ...rawExtra },
    toolName,
    toolInput,
    toolResponse,
    userPrompt: undefined
  };
}

export function makeLifecycleEnvelope(eventName: Extract<SupportedEventName, "PreCompact" | "SessionEnd">, sessionId: string | undefined, cwd: string): HookEnvelope {
  return { eventName, sessionId, cwd, raw: { hook_event_name: eventName, cwd, session_id: sessionId }, toolName: undefined, toolInput: undefined, toolResponse: undefined, userPrompt: undefined };
}

export function runNodeScript(script: string): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", script], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ stdout, stderr, exitCode }));
  });
}
