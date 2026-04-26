import { existsSync, realpathSync, statSync } from "node:fs";

import type { HookExecutionResult } from "../../core/output.js";
import { canonicalizeExistingOrParent, extractToolPath, isPathInsideDirectory, resolveToolPath } from "../shared/path.js";
import { isSuccessfulToolResponse } from "../shared/tool-output.js";
import type { BuiltInHookHandler } from "../types.js";
import { createReadPermissionTokenStore, type FileFingerprint } from "./token-store.js";

export const HOOK_ID = "write-existing-file-guard";
export const MAX_TRACKED_SESSIONS = 256;
export const MAX_TRACKED_PATHS_PER_SESSION = 1024;
export const BLOCK_MESSAGE = "File already exists. Use edit tool instead.";

export interface GuardArgs {
  readonly filePath?: string | undefined;
  readonly path?: string | undefined;
  readonly file_path?: string | undefined;
  readonly overwrite?: boolean | string | undefined;
}

export function createWriteExistingFileGuard(): BuiltInHookHandler {
  return (envelope, context) => {
    const tokenStore = createReadPermissionTokenStore({
      pluginDataDir: context.pluginDataDir,
      hookId: HOOK_ID,
      now: context.now,
      maxTrackedSessions: MAX_TRACKED_SESSIONS,
      maxTrackedPathsPerSession: MAX_TRACKED_PATHS_PER_SESSION
    });

    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      tokenStore.deleteSession(envelope.sessionId);
      return emptyResult();
    }

    if (envelope.eventName === "PostToolUse" && toolNameEquals(envelope.toolName, "Read")) {
      if (envelope.sessionId === undefined || context.pluginDataDir === undefined || !isSuccessfulToolResponse(envelope.toolResponse)) {
        return emptyResult();
      }

      const canonicalPath = canonicalToolPathInsideCwd(envelope.toolInput, context.cwd);
      if (canonicalPath === undefined || !existsSync(canonicalPath)) {
        return emptyResult();
      }

      const fingerprint = fileFingerprint(canonicalPath);
      if (fingerprint === undefined) {
        return emptyResult();
      }

      tokenStore.grantReadToken(envelope.sessionId, canonicalPath, fingerprint);
      return emptyResult();
    }

    if (envelope.eventName !== "PreToolUse" || !toolNameEquals(envelope.toolName, "Write")) {
      return emptyResult();
    }

    const inputPath = extractToolPath(envelope.toolInput);
    if (inputPath === undefined || envelope.toolInput === undefined) {
      return emptyResult();
    }

    const canonicalPath = canonicalizeExistingOrParent(resolveToolPath(context.cwd, inputPath));
    const canonicalCwd = canonicalizeExistingOrParent(context.cwd);
    const canonicalPluginDataDir = context.pluginDataDir === undefined ? undefined : canonicalizeExistingOrParent(context.pluginDataDir);

    if (canonicalPluginDataDir !== undefined && isPathInsideDirectory(canonicalPluginDataDir, canonicalPath)) {
      return { hookId: HOOK_ID, permissionDecision: "allow" };
    }

    if (!isPathInsideDirectory(canonicalCwd, canonicalPath)) {
      return emptyResult();
    }

    if (!existsSync(canonicalPath)) {
      return emptyResult();
    }

    if (isOverwriteEnabled(readOverwrite(envelope.toolInput))) {
      const invalidation = tokenStore.invalidateForOverwrite(canonicalPath, envelope.sessionId);
      if (invalidation === "locked") {
        return denyResult();
      }
      return {
        hookId: HOOK_ID,
        permissionDecision: "allow",
        updatedInput: cloneWithoutOverwrite(envelope.toolInput)
      };
    }

    if (context.pluginDataDir === undefined || envelope.sessionId === undefined) {
      return denyResult();
    }

    const fingerprint = fileFingerprint(canonicalPath);
    if (fingerprint === undefined) {
      return denyResult();
    }

    const consumeResult = tokenStore.consumeTokenAndInvalidateOtherSessions(envelope.sessionId, canonicalPath, fingerprint);
    if (consumeResult === "consumed") {
      return { hookId: HOOK_ID, permissionDecision: "allow" };
    }

    return denyResult();
  };
}

function canonicalToolPathInsideCwd(toolInput: Record<string, unknown> | undefined, cwd: string): string | undefined {
  const inputPath = extractToolPath(toolInput);
  if (inputPath === undefined) {
    return undefined;
  }
  const canonicalPath = canonicalizeExistingOrParent(resolveToolPath(cwd, inputPath));
  const canonicalCwd = canonicalizeExistingOrParent(cwd);
  return isPathInsideDirectory(canonicalCwd, canonicalPath) ? canonicalPath : undefined;
}

function fileFingerprint(canonicalPath: string): FileFingerprint | undefined {
  try {
    const realpath = realpathSync(canonicalPath);
    const stats = statSync(realpath);
    return { realpath, mtimeMs: stats.mtimeMs, size: stats.size, dev: stats.dev, ino: stats.ino };
  } catch {
    // Fail closed: if an existing file cannot be fingerprinted, unsafe writes are denied.
    return undefined;
  }
}

function emptyResult(): HookExecutionResult {
  return { hookId: HOOK_ID };
}

function denyResult(): HookExecutionResult {
  return { hookId: HOOK_ID, permissionDecision: "deny", message: BLOCK_MESSAGE };
}

function toolNameEquals(toolName: string | undefined, expected: string): boolean {
  return toolName?.toLowerCase() === expected.toLowerCase();
}

function readOverwrite(toolInput: Record<string, unknown>): boolean | string | undefined {
  const value = toolInput.overwrite;
  return typeof value === "boolean" || typeof value === "string" ? value : undefined;
}

function isOverwriteEnabled(value: boolean | string | undefined): boolean {
  if (value === true) {
    return true;
  }
  return typeof value === "string" && value.toLowerCase() === "true";
}

function cloneWithoutOverwrite(toolInput: Record<string, unknown>): Record<string, unknown> {
  const updatedInput = { ...toolInput };
  delete updatedInput.overwrite;
  return updatedInput;
}
