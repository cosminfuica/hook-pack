// Native Claude Code adaptations:
// - native HookEnvelope + HookRuntimeContext handler factory
// - PostToolUse Read additionalContext instead of output mutation
// - file-backed JSON state under CLAUDE_PLUGIN_DATA
// - PreCompact and SessionEnd lifecycle cleanup
// - shared collectDirectoryContext traversal and dynamic truncation
// - root AGENTS.md injection based on docs/architecture/claude-code-root-agents-verification.md

import type { HookExecutionResult } from "../../core/output.js";
import { truncateContent } from "../shared/context-block.js";
import { collectDirectoryContext } from "../shared/directory-context.js";
import { createDynamicTruncator, type DynamicTruncator } from "../shared/dynamic-truncator.js";
import { deleteHookSessionState } from "../shared/lifecycle-state.js";
import { extractToolPath } from "../shared/path.js";
import { createJsonStateStore } from "../shared/state-store.js";
import { isSuccessfulToolResponse } from "../shared/tool-output.js";
import type { BuiltInHookHandler } from "../types.js";

const HOOK_ID = "directory-agents-injector";
const STATE_VERSION = 1;
const FILENAME = "AGENTS.md";
const HEADING = "Directory Context";
const TRUNCATION_MARKER = "__HOOK_PACK_TRUNCATED_CONTEXT__";

interface DirectoryInjectorState {
  readonly injectedDirectories: readonly string[];
}

export function createDirectoryAgentsInjector(): BuiltInHookHandler {
  return async (envelope, context) => {
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      deleteHookSessionState({ pluginDataDir: context.pluginDataDir, hookId: HOOK_ID, sessionId: envelope.sessionId });
      return emptyResult();
    }

    if (envelope.eventName !== "PostToolUse" || !toolNameEquals(envelope.toolName, "Read")) {
      return emptyResult();
    }

    if (
      envelope.sessionId === undefined ||
      context.pluginDataDir === undefined ||
      envelope.toolResponse === undefined ||
      envelope.toolResponse === null ||
      !isSuccessfulToolResponse(envelope.toolResponse)
    ) {
      return emptyResult();
    }

    const filePath = extractReadPath(envelope.toolInput, envelope.toolResponse);
    if (filePath === undefined) {
      return emptyResult();
    }

    const store = createJsonStateStore<DirectoryInjectorState>({
      pluginDataDir: context.pluginDataDir,
      hookId: HOOK_ID,
      sessionId: envelope.sessionId,
      version: STATE_VERSION
    });
    const state = store.load();
    const alreadyInjectedDirectories = new Set(state?.injectedDirectories ?? []);
    const result = await collectDirectoryContext({
      cwd: context.cwd,
      filePath,
      filename: FILENAME,
      heading: HEADING,
      includeRoot: true,
      truncator: createMarkedTruncator(context.userConfig.maxContextChars),
      alreadyInjectedDirectories,
      sessionId: envelope.sessionId
    });

    if (result.context.length === 0 || result.injectedDirectories.length === 0) {
      return emptyResult();
    }

    const nextInjectedDirectories = uniqueStrings([...alreadyInjectedDirectories, ...result.injectedDirectories]);
    if (!store.save({ injectedDirectories: nextInjectedDirectories })) {
      return emptyResult();
    }

    return { hookId: HOOK_ID, additionalContext: replaceTruncationMarkers(result.context) };
  };
}

function emptyResult(): HookExecutionResult {
  return { hookId: HOOK_ID };
}

function toolNameEquals(toolName: string | undefined, expected: string): boolean {
  return toolName?.toLowerCase() === expected.toLowerCase();
}

function extractReadPath(toolInput: Record<string, unknown> | undefined, toolResponse: unknown): string | undefined {
  const inputPath = extractToolPath(toolInput);
  if (inputPath !== undefined) {
    return inputPath;
  }

  if (!isRecord(toolResponse) || !isRecord(toolResponse.metadata)) {
    return undefined;
  }

  return readString(toolResponse.metadata.filePath) ?? readString(toolResponse.metadata.file_path);
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createMarkedTruncator(maxContextChars: number): DynamicTruncator {
  const truncator = createDynamicTruncator({ maxContextChars });
  return {
    truncate: async (sessionId, content) => {
      const truncated = await truncator.truncate(sessionId, content);
      if (!truncated.truncated) {
        return truncated;
      }
      return { result: `${truncated.result}\n\n${TRUNCATION_MARKER}`, truncated: true };
    }
  };
}

function replaceTruncationMarkers(context: string): string {
  let currentPath = "";
  return context
    .split("\n")
    .map((line) => {
      const path = parseContextPath(line);
      if (path !== undefined) {
        currentPath = path;
      }
      return line.replaceAll(TRUNCATION_MARKER, truncationNotice(currentPath));
    })
    .join("\n");
}

function parseContextPath(line: string): string | undefined {
  const prefix = `[${HEADING}: `;
  if (!line.startsWith(prefix) || !line.endsWith("]")) {
    return undefined;
  }
  return line.slice(prefix.length, -1);
}

function truncationNotice(path: string): string {
  return truncateContent("x", 0, path).content.trimStart();
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}
