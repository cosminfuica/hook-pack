import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface HookPackConfig {
  readonly enabled: boolean;
  readonly enableAllHooksByDefault: boolean;
  readonly enabledHooks: readonly string[];
  readonly disabledHooks: readonly string[];
  readonly maxContextChars: number;
  readonly includeUserRules: boolean;
}

export interface PartialHookPackConfig {
  readonly enabled?: boolean | undefined;
  readonly enableAllHooksByDefault?: boolean | undefined;
  readonly enabledHooks?: readonly string[] | undefined;
  readonly disabledHooks?: readonly string[] | undefined;
  readonly maxContextChars?: number | undefined;
  readonly includeUserRules?: boolean | undefined;
}

export interface ConfigEnvironment {
  readonly CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS?: string | undefined;
  readonly CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS?: string | undefined;
  readonly CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT?: string | undefined;
  readonly CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS?: string | undefined;
  readonly CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES?: string | undefined;
}

type FrontmatterKey =
  | "enabled"
  | "enable_all_hooks_by_default"
  | "enabled_hooks"
  | "disabled_hooks"
  | "max_context_chars"
  | "include_user_rules";

export const DEFAULT_CONFIG: HookPackConfig = {
  enabled: true,
  enableAllHooksByDefault: false,
  enabledHooks: [],
  disabledHooks: [],
  maxContextChars: 20_000,
  includeUserRules: false
};

export function parseHookList(value: string | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return [];
  }

  const listValue = trimmedValue.startsWith("[") && trimmedValue.endsWith("]")
    ? trimmedValue.slice(1, -1)
    : trimmedValue;

  return dedupeHookIds(listValue.split(",").map((hookId) => cleanScalarValue(hookId)));
}

export function mergeConfig(base: HookPackConfig, override: PartialHookPackConfig): HookPackConfig {
  return {
    enabled: override.enabled ?? base.enabled,
    enableAllHooksByDefault: override.enableAllHooksByDefault ?? base.enableAllHooksByDefault,
    enabledHooks: override.enabledHooks !== undefined ? dedupeHookIds(override.enabledHooks) : base.enabledHooks,
    disabledHooks: override.disabledHooks !== undefined ? dedupeHookIds(override.disabledHooks) : base.disabledHooks,
    maxContextChars: override.maxContextChars ?? base.maxContextChars,
    includeUserRules: override.includeUserRules ?? base.includeUserRules
  };
}

export function readEnvironmentConfig(environment: ConfigEnvironment = process.env): PartialHookPackConfig {
  const config: MutablePartialHookPackConfig = {};

  const enabledHooks = parseHookList(environment.CLAUDE_PLUGIN_OPTION_ENABLED_HOOKS);
  if (enabledHooks.length > 0) {
    config.enabledHooks = enabledHooks;
  }

  const disabledHooks = parseHookList(environment.CLAUDE_PLUGIN_OPTION_DISABLED_HOOKS);
  if (disabledHooks.length > 0) {
    config.disabledHooks = disabledHooks;
  }

  const enableAllHooksByDefault = parseBooleanValue(
    environment.CLAUDE_PLUGIN_OPTION_ENABLE_ALL_HOOKS_BY_DEFAULT
  );
  if (enableAllHooksByDefault !== undefined) {
    config.enableAllHooksByDefault = enableAllHooksByDefault;
  }

  const maxContextChars = parsePositiveIntegerValue(environment.CLAUDE_PLUGIN_OPTION_MAX_CONTEXT_CHARS);
  if (maxContextChars !== undefined) {
    config.maxContextChars = maxContextChars;
  }

  const includeUserRules = parseBooleanValue(environment.CLAUDE_PLUGIN_OPTION_INCLUDE_USER_RULES);
  if (includeUserRules !== undefined) {
    config.includeUserRules = includeUserRules;
  }

  return config;
}

export function parseProjectLocalFrontmatter(markdown: string): PartialHookPackConfig {
  const frontmatter = extractFrontmatter(markdown);
  if (frontmatter === undefined) {
    return {};
  }

  const fields = parseFrontmatterFields(frontmatter);
  const config: MutablePartialHookPackConfig = {};

  const enabled = parseBooleanValue(fields.enabled);
  if (enabled !== undefined) {
    config.enabled = enabled;
  }

  const enableAllHooksByDefault = parseBooleanValue(fields.enable_all_hooks_by_default);
  if (enableAllHooksByDefault !== undefined) {
    config.enableAllHooksByDefault = enableAllHooksByDefault;
  }

  const enabledHooks = parseHookList(fields.enabled_hooks);
  if (enabledHooks.length > 0) {
    config.enabledHooks = enabledHooks;
  }

  const disabledHooks = parseHookList(fields.disabled_hooks);
  if (disabledHooks.length > 0) {
    config.disabledHooks = disabledHooks;
  }

  const maxContextChars = parsePositiveIntegerValue(fields.max_context_chars);
  if (maxContextChars !== undefined) {
    config.maxContextChars = maxContextChars;
  }

  const includeUserRules = parseBooleanValue(fields.include_user_rules);
  if (includeUserRules !== undefined) {
    config.includeUserRules = includeUserRules;
  }

  return config;
}

export function readProjectLocalConfig(cwd: string): PartialHookPackConfig {
  const configPath = join(cwd, ".claude", "hook-pack.local.md");
  if (!existsSync(configPath)) {
    return {};
  }

  return parseProjectLocalFrontmatter(readFileSync(configPath, "utf8"));
}

export function loadConfig(cwd: string, env: ConfigEnvironment = process.env): HookPackConfig {
  const withEnvironment = mergeConfig(DEFAULT_CONFIG, readEnvironmentConfig(env));
  return mergeConfig(withEnvironment, readProjectLocalConfig(cwd));
}

interface MutablePartialHookPackConfig {
  enabled?: boolean | undefined;
  enableAllHooksByDefault?: boolean | undefined;
  enabledHooks?: readonly string[] | undefined;
  disabledHooks?: readonly string[] | undefined;
  maxContextChars?: number | undefined;
  includeUserRules?: boolean | undefined;
}

function extractFrontmatter(markdown: string): string | undefined {
  const normalizedMarkdown = markdown.replaceAll("\r\n", "\n");
  const lines = normalizedMarkdown.split("\n");

  if (lines[0] !== "---") {
    return undefined;
  }

  const closingMarkerIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  if (closingMarkerIndex === -1) {
    return undefined;
  }

  return lines.slice(1, closingMarkerIndex).join("\n");
}

function parseFrontmatterFields(frontmatter: string): Record<FrontmatterKey, string | undefined> {
  const fields: Record<FrontmatterKey, string | undefined> = {
    enabled: undefined,
    enable_all_hooks_by_default: undefined,
    enabled_hooks: undefined,
    disabled_hooks: undefined,
    max_context_chars: undefined,
    include_user_rules: undefined
  };

  for (const line of frontmatter.split("\n")) {
    const trimmedLine = line.trim();
    if (trimmedLine === "" || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex);
    if (!isFrontmatterKey(key)) {
      continue;
    }

    fields[key] = trimmedLine.slice(separatorIndex + 1).trim();
  }

  return fields;
}

function parseBooleanValue(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = cleanScalarValue(value).toLowerCase();
  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return undefined;
}

function parsePositiveIntegerValue(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = cleanScalarValue(value);
  if (!/^\d+$/.test(normalizedValue)) {
    return undefined;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return undefined;
  }

  return parsedValue;
}

function cleanScalarValue(value: string): string {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 2) {
    return trimmedValue;
  }

  const firstCharacter = trimmedValue[0];
  const lastCharacter = trimmedValue[trimmedValue.length - 1];
  if ((firstCharacter === '"' && lastCharacter === '"') || (firstCharacter === "'" && lastCharacter === "'")) {
    return trimmedValue.slice(1, -1).trim();
  }

  return trimmedValue;
}

function dedupeHookIds(hookIds: readonly string[]): string[] {
  const dedupedHookIds: string[] = [];
  const seenHookIds = new Set<string>();

  for (const hookId of hookIds) {
    const normalizedHookId = hookId.trim();
    if (normalizedHookId === "" || seenHookIds.has(normalizedHookId)) {
      continue;
    }

    seenHookIds.add(normalizedHookId);
    dedupedHookIds.push(normalizedHookId);
  }

  return dedupedHookIds;
}

function isFrontmatterKey(value: string): value is FrontmatterKey {
  return (
    value === "enabled" ||
    value === "enable_all_hooks_by_default" ||
    value === "enabled_hooks" ||
    value === "disabled_hooks" ||
    value === "max_context_chars" ||
    value === "include_user_rules"
  );
}
