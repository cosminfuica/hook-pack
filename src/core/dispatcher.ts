import type { HookPackConfig } from "./config.js";
import type { Diagnostic } from "./diagnostics.js";
import type { HookEnvelope, SupportedEventName } from "./events.js";
import { combineHookResults, type ClaudeHookOutput, type HookExecutionResult } from "./output.js";
import { selectRegistryEntries, validateRegistry, type RegistryEntry } from "./registry.js";

export interface DispatchRequest {
  readonly envelope: HookEnvelope;
  readonly entries: readonly RegistryEntry[];
  readonly config: HookPackConfig;
  readonly execute: (entry: RegistryEntry, envelope: HookEnvelope) => Promise<HookExecutionResult>;
}

export async function dispatchHookEvent(request: DispatchRequest): Promise<ClaudeHookOutput> {
  const validationDiagnostics = validateRegistry(request.entries);
  if (validationDiagnostics.length > 0) {
    return safeDiagnosticOutput(validationDiagnostics);
  }

  const selection = selectRegistryEntries(request.entries, request.envelope, request.config);
  if (selection.diagnostics.length > 0) {
    return safeDiagnosticOutput(selection.diagnostics);
  }

  const results = await Promise.all(
    selection.entries.map((entry) => executeEntrySafely(entry, request.envelope, request.execute))
  );

  return combineHookResults(request.envelope.eventName, results);
}

async function executeEntrySafely(
  entry: RegistryEntry,
  envelope: HookEnvelope,
  execute: DispatchRequest["execute"]
): Promise<HookExecutionResult> {
  try {
    return await withTimeout(execute(entry, envelope), entry.timeoutMs);
  } catch (error) {
    return failedHookResult(entry.id, envelope.eventName, getFailureReason(error));
  }
}

function safeDiagnosticOutput(diagnostics: readonly Diagnostic[]): ClaudeHookOutput {
  return {
    systemMessage: `hook-pack: ${diagnostics.map((diagnostic) => diagnostic.message).join("\n")}`
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function failedHookResult(hookId: string, eventName: SupportedEventName, reason: string): HookExecutionResult {
  const message = `hook ${hookId} failed: ${reason}`;

  switch (eventName) {
    case "PreToolUse":
      return {
        hookId,
        permissionDecision: "deny",
        message
      };
    case "Stop":
    case "SubagentStop":
    case "PostToolUse":
      return {
        hookId,
        stopDecision: "block",
        message
      };
    default:
      return {
        hookId,
        additionalContext: message
      };
  }
}

function getFailureReason(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }

  return "unknown error";
}
