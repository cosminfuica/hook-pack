import type { SupportedEventName } from "./events.js";

export type PermissionDecision = "allow" | "ask" | "deny";
export type StopDecision = "pass" | "block";

export interface HookExecutionResult {
  readonly hookId: string;
  readonly permissionDecision?: PermissionDecision;
  readonly stopDecision?: StopDecision;
  readonly message?: string;
  readonly additionalContext?: string;
  readonly updatedInput?: Record<string, unknown>;
}

export interface ClaudeHookOutput {
  readonly decision?: "block";
  readonly reason?: string;
  readonly systemMessage?: string;
  readonly hookSpecificOutput?: {
    readonly hookEventName: SupportedEventName;
    readonly permissionDecision?: PermissionDecision;
    readonly permissionDecisionReason?: string;
    readonly additionalContext?: string;
    readonly updatedInput?: Record<string, unknown>;
  };
}

const PERMISSION_PRIORITY: Record<PermissionDecision, number> = {
  deny: 4,
  ask: 3,
  allow: 1
};

export function combineHookResults(
  eventName: SupportedEventName,
  results: readonly HookExecutionResult[]
): ClaudeHookOutput {
  const sortedResults = [...results].sort((left, right) => left.hookId.localeCompare(right.hookId));

  switch (eventName) {
    case "PreToolUse":
      return combinePreToolUseResults(eventName, sortedResults);
    case "Stop":
    case "SubagentStop":
      return combineStopResults(sortedResults);
    case "PostToolUse":
      return combinePostToolUseResults(eventName, sortedResults);
    case "SessionStart":
    case "UserPromptSubmit":
    case "PreCompact":
      return combineContextResults(eventName, sortedResults);
    default:
      return withSystemMessage({}, collectMessages(sortedResults));
  }
}

function combinePreToolUseResults(
  eventName: SupportedEventName,
  sortedResults: readonly HookExecutionResult[]
): ClaudeHookOutput {
  const selectedResult = sortedResults.reduce<HookExecutionResult | undefined>((selected, result) => {
    if (result.permissionDecision === undefined) {
      return selected;
    }

    if (selected?.permissionDecision === undefined) {
      return result;
    }

    const selectedPriority = PERMISSION_PRIORITY[selected.permissionDecision];
    const resultPriority = PERMISSION_PRIORITY[result.permissionDecision];

    return resultPriority > selectedPriority ? result : selected;
  }, undefined);

  if (selectedResult?.permissionDecision === undefined) {
    return withSystemMessage({}, collectMessages(sortedResults));
  }

  const hookSpecificOutput: NonNullable<ClaudeHookOutput["hookSpecificOutput"]> = {
    hookEventName: eventName,
    permissionDecision: selectedResult.permissionDecision,
    ...(selectedResult.message === undefined ? {} : { permissionDecisionReason: selectedResult.message }),
    ...(selectedResult.updatedInput === undefined ? {} : { updatedInput: selectedResult.updatedInput })
  };

  return withSystemMessage({ hookSpecificOutput }, collectSelectedMessage(selectedResult));
}

function combineStopResults(sortedResults: readonly HookExecutionResult[]): ClaudeHookOutput {
  const blockResult = sortedResults.find((result) => result.stopDecision === "block");
  if (blockResult !== undefined) {
    const reason = blockResult.message ?? "Blocked by hook";
    return {
      decision: "block",
      reason,
      systemMessage: formatHookLine(blockResult.hookId, reason)
    };
  }

  return withSystemMessage({}, collectMessages(sortedResults));
}

function combinePostToolUseResults(
  eventName: SupportedEventName,
  sortedResults: readonly HookExecutionResult[]
): ClaudeHookOutput {
  const blockResult = sortedResults.find((result) => result.stopDecision === "block");
  if (blockResult !== undefined) {
    const reason = blockResult.message ?? "Blocked by hook";
    return {
      decision: "block",
      reason,
      systemMessage: formatHookLine(blockResult.hookId, reason)
    };
  }

  return combineContextResults(eventName, sortedResults);
}

function combineContextResults(
  eventName: SupportedEventName,
  sortedResults: readonly HookExecutionResult[]
): ClaudeHookOutput {
  const additionalContext = collectAdditionalContext(sortedResults);
  const output: ClaudeHookOutput = additionalContext.length === 0 ? {} : {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: additionalContext.join("\n")
    }
  };

  return withSystemMessage(output, collectMessages(sortedResults));
}

function collectMessages(sortedResults: readonly HookExecutionResult[]): string[] {
  return sortedResults.flatMap(collectSelectedMessage);
}

function collectAdditionalContext(sortedResults: readonly HookExecutionResult[]): string[] {
  return sortedResults.flatMap((result) => {
    if (result.additionalContext === undefined) {
      return [];
    }

    return [formatHookLine(result.hookId, result.additionalContext)];
  });
}

function collectSelectedMessage(result: HookExecutionResult): string[] {
  if (result.message === undefined) {
    return [];
  }

  return [formatHookLine(result.hookId, result.message)];
}

function formatHookLine(hookId: string, value: string): string {
  return `${hookId}: ${value}`;
}

function withSystemMessage(output: ClaudeHookOutput, messages: readonly string[]): ClaudeHookOutput {
  if (messages.length === 0) {
    return output;
  }

  return {
    ...output,
    systemMessage: messages.join("\n")
  };
}
