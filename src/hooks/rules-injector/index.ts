import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { HookExecutionResult } from "../../core/output.js";
import { createDynamicTruncator } from "../shared/dynamic-truncator.js";
import { deleteHookSessionState } from "../shared/lifecycle-state.js";
import { canonicalizeExistingOrParent, isPathInsideDirectory } from "../shared/path.js";
import { createFileBackedRuleScanCache, findProjectRoot, loadMatchingRules, type MatchingRuleBlock } from "../shared/rule-discovery.js";
import { createJsonStateStore } from "../shared/state-store.js";
import { extractPostToolPath, isSuccessfulToolResponse } from "../shared/tool-output.js";
import type { BuiltInHookHandler } from "../types.js";
import { createParsedRuleCache } from "./parsed-rule-cache.js";

const HOOK_ID = "rules-injector";
const STATE_VERSION = 1;
const TRACKED_TOOLS = new Set(["read", "write", "edit", "multiedit"]);

interface RulesInjectorState {
  readonly injectedRealpaths: readonly string[];
  readonly injectedContentHashes: readonly string[];
}

export function createRulesInjector(): BuiltInHookHandler {
  return async (envelope, context) => {
    if (envelope.eventName === "PreCompact" || envelope.eventName === "SessionEnd") {
      deleteSessionState(context.pluginDataDir, envelope.sessionId);
      return emptyResult();
    }

    if (envelope.eventName !== "PostToolUse" || !isTrackedTool(envelope.toolName)) {
      return emptyResult();
    }

    if (envelope.sessionId === undefined || context.pluginDataDir === undefined || !isSuccessfulToolResponse(envelope.toolResponse)) {
      return emptyResult();
    }

    const targetPath = getRuleInjectionFilePath(envelope.toolInput, envelope.toolResponse, context.cwd);
    if (targetPath === undefined) {
      return emptyResult();
    }

    const canonicalCwd = canonicalizeExistingOrParent(context.cwd);
    const canonicalTargetPath = canonicalizeExistingOrParent(targetPath);
    if (!isPathInsideDirectory(canonicalCwd, canonicalTargetPath)) {
      return emptyResult();
    }

    const projectRoot = findProjectRoot(canonicalTargetPath, canonicalCwd);
    if (projectRoot === undefined) {
      return emptyResult();
    }

    const store = createJsonStateStore<RulesInjectorState>({
      pluginDataDir: context.pluginDataDir,
      hookId: `${HOOK_ID}/sessions`,
      sessionId: envelope.sessionId,
      version: STATE_VERSION
    });
    const scanCache = createFileBackedRuleScanCache(scanCachePath(context.pluginDataDir, envelope.sessionId));
    const parsedRuleCache = createParsedRuleCache({ pluginDataDir: context.pluginDataDir });
    const rules = loadMatchingRules({
      projectRoot,
      targetPath: canonicalTargetPath,
      homedir: context.env.HOME ?? homedir(),
      includeUserRules: context.userConfig.includeUserRules,
      scanCache,
      parsedRuleCache
    });
    let nextRules: MatchingRuleBlock[] = [];
    const saved = store.mutate((current) => {
      const state = normalizeRulesInjectorState(current);
      const injectedRealpaths = new Set(state.injectedRealpaths);
      const injectedContentHashes = new Set(state.injectedContentHashes);
      nextRules = selectRulesNotInjected(rules, injectedRealpaths, injectedContentHashes);
      return { injectedRealpaths: [...injectedRealpaths], injectedContentHashes: [...injectedContentHashes] };
    });

    if (!saved || nextRules.length === 0) {
      return emptyResult();
    }

    return {
      hookId: HOOK_ID,
      additionalContext: await formatRules(nextRules, envelope.sessionId, context.userConfig.maxContextChars)
    };
  };
}

export function getRuleInjectionFilePath(
  toolInput: Record<string, unknown> | undefined,
  toolResponse: unknown,
  cwd: string
): string | undefined {
  return extractPostToolPath(toolInput, toolResponse, cwd);
}

function emptyResult(): HookExecutionResult {
  return { hookId: HOOK_ID };
}

function isTrackedTool(toolName: string | undefined): boolean {
  return toolName !== undefined && TRACKED_TOOLS.has(toolName.toLowerCase());
}

function selectRulesNotInjected(
  rules: readonly MatchingRuleBlock[],
  injectedRealpaths: Set<string>,
  injectedContentHashes: Set<string>
): MatchingRuleBlock[] {
  const nextRules: MatchingRuleBlock[] = [];
  for (const rule of rules) {
    if (injectedRealpaths.has(rule.realpath) || injectedContentHashes.has(rule.bodyHash)) {
      continue;
    }
    nextRules.push(rule);
    injectedRealpaths.add(rule.realpath);
    injectedContentHashes.add(rule.bodyHash);
  }
  return nextRules;
}

function normalizeRulesInjectorState(current: RulesInjectorState | undefined): RulesInjectorState {
  if (
    current !== undefined &&
    Array.isArray(current.injectedRealpaths) &&
    current.injectedRealpaths.every((item) => typeof item === "string") &&
    Array.isArray(current.injectedContentHashes) &&
    current.injectedContentHashes.every((item) => typeof item === "string")
  ) {
    return current;
  }

  return { injectedRealpaths: [], injectedContentHashes: [] };
}

async function formatRules(rules: readonly MatchingRuleBlock[], sessionId: string, maxContextChars: number): Promise<string> {
  const truncator = createDynamicTruncator({ maxContextChars });
  const formatted: string[] = [];
  for (const rule of rules) {
    const truncated = await truncator.truncate(sessionId, rule.body);
    const notice = truncated.truncated
      ? `\n\n[Note: Content was truncated to save context window space. For full context, please read the file directly: ${rule.projectRelativePath}]`
      : "";
    formatted.push(`[Rule: ${rule.projectRelativePath}]\n[Match: ${rule.matchReason}]\n${truncated.result}${notice}`);
  }
  return formatted.join("\n\n");
}

function deleteSessionState(pluginDataDir: string | undefined, sessionId: string | undefined): void {
  try {
    deleteHookSessionState({ pluginDataDir, hookId: `${HOOK_ID}/sessions`, sessionId });
  } catch (error) {
    ignoreBestEffortCleanupError(error);
  }

  if (pluginDataDir === undefined || sessionId === undefined || sessionId.trim() === "") {
    return;
  }

  try {
    rmSync(scanCachePath(pluginDataDir, sessionId), { force: true });
  } catch (error) {
    ignoreBestEffortCleanupError(error);
  }
}

function ignoreBestEffortCleanupError(error: unknown): void {
  void error;
}

function scanCachePath(pluginDataDir: string, sessionId: string): string {
  return join(pluginDataDir, HOOK_ID, "scan-cache", `${encodeURIComponent(sessionId)}.json`);
}
