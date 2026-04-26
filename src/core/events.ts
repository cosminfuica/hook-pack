import { isRecord, readRecordField, readStringField } from "./json.js";

export const SUPPORTED_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "UserPromptExpansion",
  "PreToolUse",
  "PermissionRequest",
  "PermissionDenied",
  "PostToolUse",
  "PostToolUseFailure",
  "PostToolBatch",
  "Notification",
  "SubagentStart",
  "SubagentStop",
  "TaskCreated",
  "TaskCompleted",
  "Stop",
  "StopFailure",
  "TeammateIdle",
  "InstructionsLoaded",
  "ConfigChange",
  "CwdChanged",
  "FileChanged",
  "WorktreeCreate",
  "WorktreeRemove",
  "PreCompact",
  "PostCompact",
  "Elicitation",
  "ElicitationResult",
  "SessionEnd"
] as const;

export const REGISTERED_DISPATCH_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "SubagentStop",
  "PreCompact",
  "Notification",
  "SessionEnd"
] as const;

export type SupportedEventName = (typeof SUPPORTED_EVENTS)[number];

export type MatcherBehavior = "tool" | "ignored" | "event-specific";

export type OutputCapability = "permission" | "context" | "block" | "notification";

export interface EventDefinition {
  readonly name: SupportedEventName;
  readonly matcherBehavior: MatcherBehavior;
  readonly outputCapabilities: readonly OutputCapability[];
}

export const EVENT_DEFINITIONS: readonly EventDefinition[] = SUPPORTED_EVENTS.map((eventName) => ({
  name: eventName,
  matcherBehavior: getMatcherBehavior(eventName),
  outputCapabilities: getOutputCapabilities(eventName)
}));

export interface HookEnvelope {
  readonly eventName: SupportedEventName;
  readonly sessionId: string | undefined;
  readonly cwd: string;
  readonly raw: Record<string, unknown>;
  readonly toolName: string | undefined;
  readonly toolInput: Record<string, unknown> | undefined;
  readonly toolResponse: unknown | undefined;
  readonly userPrompt: string | undefined;
}

export class HookInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HookInputError";
  }
}

export function isSupportedEventName(value: unknown): value is SupportedEventName {
  return typeof value === "string" && SUPPORTED_EVENTS.includes(value as SupportedEventName);
}

export function normalizeHookInput(rawInput: unknown, expectedEventName?: string): HookEnvelope {
  if (!isRecord(rawInput)) {
    throw new HookInputError("Hook input must be an object");
  }

  const eventName = readStringField(rawInput, "hook_event_name");
  if (!isSupportedEventName(eventName)) {
    throw new HookInputError("Hook input must include supported hook_event_name");
  }

  if (expectedEventName !== undefined && eventName !== expectedEventName) {
    throw new HookInputError(`Expected ${expectedEventName} hook input but received ${eventName}`);
  }

  const cwd = readStringField(rawInput, "cwd");
  if (cwd === undefined || cwd.trim() === "") {
    throw new HookInputError("cwd must be a string");
  }

  const sessionId = readStringField(rawInput, "session_id");
  const toolName = readStringField(rawInput, "tool_name");
  if (requiresToolName(eventName) && (toolName === undefined || toolName.trim() === "")) {
    throw new HookInputError(`${eventName} hook input must include non-empty tool_name`);
  }

  const toolInput = readRecordField(rawInput, "tool_input");
  const toolResponse = rawInput.tool_response ?? rawInput.tool_result;
  const userPrompt = readStringField(rawInput, "user_prompt") ?? readStringField(rawInput, "prompt");

  return {
    eventName,
    sessionId,
    cwd,
    raw: rawInput,
    toolName,
    toolInput,
    toolResponse,
    userPrompt
  };
}

function requiresToolName(eventName: SupportedEventName): boolean {
  return getMatcherBehavior(eventName) === "tool";
}

function getMatcherBehavior(eventName: SupportedEventName): MatcherBehavior {
  switch (eventName) {
    case "PreToolUse":
    case "PostToolUse":
    case "PostToolUseFailure":
    case "PermissionRequest":
    case "PermissionDenied":
      return "tool";
    default:
      return "event-specific";
  }
}

function getOutputCapabilities(eventName: SupportedEventName): readonly OutputCapability[] {
  switch (eventName) {
    case "PreToolUse":
      return ["permission", "context"];
    case "Stop":
    case "SubagentStop":
      return ["block", "context"];
    case "UserPromptSubmit":
    case "SessionStart":
    case "PostToolUse":
    case "PreCompact":
      return ["context"];
    case "Notification":
      return ["notification"];
    default:
      return [];
  }
}
