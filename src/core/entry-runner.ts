import { runCommand as defaultRunCommand, type CommandRunRequest, type CommandRunResult } from "./command-runner.js";
import type { HookEnvelope } from "./events.js";
import { isRecord } from "./json.js";
import type { HookExecutionResult, PermissionDecision, StopDecision } from "./output.js";
import type { HookRuntimeContext } from "./runtime-context.js";
import type { RegistryEntry } from "./registry.js";
import type { BuiltInHookHandler } from "../hooks/types.js";

export const MAX_COMMAND_OUTPUT_BYTES = 64 * 1024;

export type CommandRunner = (request: CommandRunRequest) => Promise<CommandRunResult>;

export interface ExecuteRegistryEntryRequest {
  readonly entry: RegistryEntry;
  readonly envelope: HookEnvelope;
  readonly runtimeContext: HookRuntimeContext;
  readonly resolveBuiltInHookHandler: (handlerId: string) => BuiltInHookHandler | undefined;
  readonly runCommand?: CommandRunner | undefined;
}

export async function executeRegistryEntry(request: ExecuteRegistryEntryRequest): Promise<HookExecutionResult> {
  switch (request.entry.runner.kind) {
    case "internal": {
      const handler = request.resolveBuiltInHookHandler(request.entry.runner.handlerId);
      if (handler === undefined) {
        throw new Error(`missing built-in hook handler: ${request.entry.runner.handlerId}`);
      }

      return handler(request.envelope, request.runtimeContext);
    }
    case "command":
      return runRegisteredCommand(
        request.entry,
        request.envelope,
        request.entry.runner.command,
        request.runCommand ?? defaultRunCommand
      );
  }
}

async function runRegisteredCommand(
  entry: RegistryEntry,
  envelope: HookEnvelope,
  command: readonly string[],
  commandRunner: CommandRunner
): Promise<HookExecutionResult> {
  const result = await commandRunner({
    command,
    cwd: envelope.cwd,
    input: JSON.stringify(envelope.raw),
    timeoutMs: entry.timeoutMs,
    maxOutputBytes: MAX_COMMAND_OUTPUT_BYTES,
    env: process.env
  });

  if (result.timedOut) {
    throw new Error(`command timed out after ${entry.timeoutMs}ms`);
  }

  if (result.exitCode !== 0) {
    const stderr = result.stderr.trim();
    throw new Error(stderr === "" ? `command exited ${result.exitCode}` : stderr);
  }

  if (Buffer.byteLength(result.stdout, "utf8") >= MAX_COMMAND_OUTPUT_BYTES) {
    throw new Error(`command output exceeded ${MAX_COMMAND_OUTPUT_BYTES} bytes`);
  }

  let parsedOutput: unknown;
  try {
    parsedOutput = JSON.parse(result.stdout);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown parse error";
    throw new Error(`command output must be valid JSON: ${reason}`);
  }

  return normalizeCommandHookResult(entry.id, parsedOutput);
}

function normalizeCommandHookResult(hookId: string, value: unknown): HookExecutionResult {
  if (!isRecord(value)) {
    throw new Error("command output must be a JSON object");
  }

  let normalized: HookExecutionResult = {
    hookId: readHookId(value) ?? hookId
  };

  const permissionDecision = readPermissionDecision(value);
  if (permissionDecision !== undefined) {
    normalized = { ...normalized, permissionDecision };
  }

  const stopDecision = readStopDecision(value);
  if (stopDecision !== undefined) {
    normalized = { ...normalized, stopDecision };
  }

  const message = readOptionalStringProperty(value, "message");
  if (message !== undefined) {
    normalized = { ...normalized, message };
  }

  const additionalContext = readOptionalStringProperty(value, "additionalContext");
  if (additionalContext !== undefined) {
    normalized = { ...normalized, additionalContext };
  }

  const updatedInput = readUpdatedInput(value);
  if (updatedInput !== undefined) {
    normalized = { ...normalized, updatedInput };
  }

  return normalized;
}

function readHookId(value: Record<string, unknown>): string | undefined {
  if (!("hookId" in value)) {
    return undefined;
  }

  const hookId = value.hookId;
  if (typeof hookId !== "string" || hookId.trim() === "") {
    throw new Error("hookId must be a non-empty string");
  }

  return hookId;
}

function readOptionalStringProperty(value: Record<string, unknown>, propertyName: string): string | undefined {
  if (!(propertyName in value)) {
    return undefined;
  }

  const propertyValue = value[propertyName];
  if (typeof propertyValue !== "string") {
    throw new Error(`${propertyName} must be a string`);
  }

  return propertyValue;
}

function readPermissionDecision(value: Record<string, unknown>): PermissionDecision | undefined {
  if (!("permissionDecision" in value)) {
    return undefined;
  }

  const permissionDecision = value.permissionDecision;
  if (
    permissionDecision === "allow" ||
    permissionDecision === "ask" ||
    permissionDecision === "deny" ||
    permissionDecision === "defer"
  ) {
    return permissionDecision;
  }

  throw new Error("permissionDecision must be allow, ask, deny, or defer");
}

function readStopDecision(value: Record<string, unknown>): StopDecision | undefined {
  if (!("stopDecision" in value)) {
    return undefined;
  }

  const stopDecision = value.stopDecision;
  if (stopDecision === "pass" || stopDecision === "block") {
    return stopDecision;
  }

  throw new Error("stopDecision must be pass or block");
}

function readUpdatedInput(value: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!("updatedInput" in value)) {
    return undefined;
  }

  if (!isRecord(value.updatedInput)) {
    throw new Error("updatedInput must be a JSON object");
  }

  return value.updatedInput;
}
