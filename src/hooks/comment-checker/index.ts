import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { canonicalizeExistingOrParent, extractToolPath, isPathInsideDirectory, resolveToolPath } from "../shared/path.js";
import { isSuccessfulToolResponse } from "../shared/tool-output.js";
import type { BuiltInHookHandler } from "../types.js";
import { resolveCommentCheckerBinary } from "./binary-resolver.js";
import { downloadCommentCheckerBinary } from "./downloader.js";
import { cleanupStaleCommentCheckerLocks } from "./lock-store.js";
import { createPendingCommentStore, type PendingCommentCheck, type PendingCommentEdit, type PendingCommentToolName } from "./pending-store.js";
import { runCommentCheckerCommand, type CommentCheckerRunInput, type CommentCheckerRunResult } from "./runner.js";

export type { CommentCheckerRunInput, CommentCheckerRunResult } from "./runner.js";

export interface CreateCommentCheckerOptions {
  readonly runChecker?: ((input: CommentCheckerRunInput) => Promise<CommentCheckerRunResult>) | undefined;
  readonly now?: (() => number) | undefined;
  readonly budgetMs?: number | undefined;
}

const HOOK_ID = "comment-checker";
const DEFAULT_BUDGET_MS = 7_000;
const DEFAULT_RUNNER_TIMEOUT_MS = 5_500;
const DEFAULT_RUNNER_KILL_GRACE_MS = 750;
const DEFAULT_CLEANUP_WAIT_MS = 1_000;
const TRACKED_TOOLS = new Set(["write", "edit", "multiedit"]);

export function createCommentChecker(options: CreateCommentCheckerOptions = {}): BuiltInHookHandler {
  const now = options.now ?? Date.now;
  return async (envelope, context) => {
    const store = createPendingCommentStore({ pluginDataDir: context.pluginDataDir });

    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      store.deleteSession(envelope.sessionId);
      cleanupStaleCommentCheckerLocks({ pluginDataDir: context.pluginDataDir, now });
      return emptyResult();
    }

    if (envelope.eventName === "PreToolUse") {
      if (envelope.sessionId === undefined || context.pluginDataDir === undefined || envelope.toolInput === undefined || !isTrackedTool(envelope.toolName)) {
        return emptyResult();
      }

      const pending = buildPendingCheck(envelope.toolName, envelope.sessionId, envelope.toolInput, envelope.raw, context.cwd, now());
      if (pending === undefined || !isInsideCwd(context.cwd, pending.filePath)) {
        return emptyResult();
      }

      store.cleanupStale(envelope.sessionId, now());
      return store.put(envelope.sessionId, pending) ? emptyResult() : emptyResult();
    }

    if (envelope.eventName !== "PostToolUse" || envelope.sessionId === undefined || context.pluginDataDir === undefined || !isTrackedTool(envelope.toolName)) {
      return emptyResult();
    }

    if (!isSuccessfulToolResponse(envelope.toolResponse)) {
      return emptyResult();
    }

    const key = pendingKey(envelope.toolName, envelope.sessionId, envelope.toolInput, envelope.raw, context.cwd);
    if (key === undefined) {
      return emptyResult();
    }

    const pending = store.take(envelope.sessionId, key, now());
    if (pending === undefined) {
      return emptyResult();
    }

    const runInput = toRunInput(pending, context.cwd);
    if (runInput === null) {
      return emptyResult();
    }

    const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;
    const result = await withCommentCheckerBudget(budgetMs, async (signal) => {
      const runChecker = options.runChecker ?? createDefaultCheckerRunner(context, signal, budgetMs);
      return runChecker(runInput);
    });

    if (result === null || result.unavailable === true || !result.hasComments) {
      return emptyResult();
    }

    return { hookId: HOOK_ID, stopDecision: "block", message: result.message };
  };
}

function emptyResult() {
  return { hookId: HOOK_ID };
}

function createDefaultCheckerRunner(context: Parameters<BuiltInHookHandler>[1], signal: AbortSignal, budgetMs: number) {
  return async (input: CommentCheckerRunInput): Promise<CommentCheckerRunResult> => {
    const binary = await resolveCommentCheckerBinary({
      env: context.env,
      pluginDataDir: context.pluginDataDir,
      signal,
      now: context.now,
      download: (downloadSignal) => downloadCommentCheckerBinary({ pluginDataDir: context.pluginDataDir, signal: downloadSignal })
    });
    if (binary === null || signal.aborted) {
      return { hasComments: false, message: "", unavailable: true };
    }
    return runCommentCheckerCommand(binary.path, input, {
      env: context.env,
      killGraceMs: Math.min(DEFAULT_RUNNER_KILL_GRACE_MS, Math.max(25, Math.floor(budgetMs / 10))),
      signal,
      timeoutMs: Math.min(DEFAULT_RUNNER_TIMEOUT_MS, Math.max(25, budgetMs - Math.min(DEFAULT_RUNNER_KILL_GRACE_MS, Math.max(25, Math.floor(budgetMs / 10))) - 250))
    });
  };
}

async function withCommentCheckerBudget(
  budgetMs: number,
  run: (signal: AbortSignal) => Promise<CommentCheckerRunResult>
): Promise<CommentCheckerRunResult | null> {
  const controller = new AbortController();
  let timeout: NodeJS.Timeout | undefined;
  let cleanupTimeout: NodeJS.Timeout | undefined;
  const runPromise = run(controller.signal);
  try {
    const result = await Promise.race<CommentCheckerRunResult | null>([
      runPromise,
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => {
          controller.abort();
          resolve(null);
        }, budgetMs);
      })
    ]);
    if (result !== null) {
      return result;
    }
    await Promise.race([
      runPromise.catch(() => undefined),
      new Promise<void>((resolve) => {
        cleanupTimeout = setTimeout(resolve, Math.min(DEFAULT_CLEANUP_WAIT_MS, Math.max(25, budgetMs)));
      })
    ]);
    return null;
  } catch {
    return { hasComments: false, message: "", unavailable: true };
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    if (cleanupTimeout !== undefined) {
      clearTimeout(cleanupTimeout);
    }
  }
}

function buildPendingCheck(
  toolName: string | undefined,
  sessionId: string,
  toolInput: Record<string, unknown>,
  raw: Record<string, unknown>,
  cwd: string,
  createdAt: number
): PendingCommentCheck | undefined {
  const normalizedToolName = normalizeToolName(toolName);
  if (normalizedToolName === undefined) {
    return undefined;
  }
  const inputPath = extractToolPath(toolInput);
  if (inputPath === undefined) {
    return undefined;
  }
  const filePath = canonicalizeExistingOrParent(resolveToolPath(cwd, inputPath));
  const key = pendingKey(toolName, sessionId, toolInput, raw, cwd);
  if (key === undefined) {
    return undefined;
  }

  return {
    key,
    toolName: normalizedToolName,
    sessionId,
    filePath,
    createdAt
  };
}

function pendingKey(
  toolName: string | undefined,
  sessionId: string,
  toolInput: Record<string, unknown> | undefined,
  raw: Record<string, unknown>,
  cwd: string
): string | undefined {
  const rawKey = readRawKey(raw);
  if (rawKey !== undefined) {
    return rawKey;
  }

  const normalizedToolName = normalizeToolName(toolName);
  if (normalizedToolName === undefined || toolInput === undefined) {
    return undefined;
  }
  const inputPath = extractToolPath(toolInput);
  if (inputPath === undefined) {
    return undefined;
  }
  const filePath = canonicalizeExistingOrParent(resolveToolPath(cwd, inputPath));
  return sha256(`${sessionId}\0${normalizedToolName}\0${filePath}\0${sha256(JSON.stringify(pendingPayload(normalizedToolName, toolInput)))}`);
}

function pendingPayload(toolName: PendingCommentToolName, toolInput: Record<string, unknown>) {
  switch (toolName) {
    case "write":
      return { content: readString(toolInput.content) };
    case "edit":
      return { oldString: readString(toolInput.old_string) ?? readString(toolInput.oldString), newString: readString(toolInput.new_string) ?? readString(toolInput.newString) };
    case "multiedit":
      return { edits: readEdits(toolInput.edits) };
  }
}

function toRunInput(pending: PendingCommentCheck, cwd: string): CommentCheckerRunInput | null {
  const content = readFinalFileContent(pending.filePath);
  if (content === null) {
    return null;
  }
  return {
    sessionId: pending.sessionId,
    cwd,
    toolName: pending.toolName,
    filePath: pending.filePath,
    ...(content === undefined ? {} : { content })
  };
}

function readFinalFileContent(filePath: string): string | undefined | null {
  try {
    if (!existsSync(filePath)) {
      return undefined;
    }
    return readFileSync(filePath, "utf8");
  } catch {
    // Fail open when final content cannot be read after the tool completes.
    return null;
  }
}

function readRawKey(raw: Record<string, unknown>): string | undefined {
  return readString(raw.tool_use_id) ?? readString(raw.tool_call_id);
}

function isTrackedTool(toolName: string | undefined): boolean {
  const normalized = normalizeToolName(toolName);
  return normalized !== undefined && TRACKED_TOOLS.has(normalized);
}

function normalizeToolName(toolName: string | undefined): PendingCommentToolName | undefined {
  const normalized = toolName?.toLowerCase();
  return normalized === "write" || normalized === "edit" || normalized === "multiedit" ? normalized : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readEdits(value: unknown): readonly PendingCommentEdit[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const edits: PendingCommentEdit[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.old_string !== "string" || typeof item.new_string !== "string") {
      return undefined;
    }
    edits.push({ old_string: item.old_string, new_string: item.new_string });
  }
  return edits;
}

function isInsideCwd(cwd: string, filePath: string): boolean {
  const canonicalCwd = canonicalizeExistingOrParent(cwd);
  return isPathInsideDirectory(canonicalCwd, filePath);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
