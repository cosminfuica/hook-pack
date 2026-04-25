import type { HookPackConfig } from "./config.js";
import { type Diagnostic, sortDiagnostics } from "./diagnostics.js";
import type { HookEnvelope, SupportedEventName } from "./events.js";

export type HookRunnerSpec =
  | {
      readonly kind: "internal";
      readonly handlerId: string;
    }
  | {
      readonly kind: "command";
      readonly command: readonly string[];
    };

export interface RegistryEntry {
  readonly id: string;
  readonly events: readonly SupportedEventName[];
  readonly runner: HookRunnerSpec;
  readonly timeoutMs: number;
  readonly defaultEnabled: boolean;
}

export interface RegistrySelection {
  readonly entries: readonly RegistryEntry[];
  readonly diagnostics: readonly Diagnostic[];
}

export const BUILT_IN_REGISTRY: readonly RegistryEntry[] = [];

const HOOK_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const MIN_TIMEOUT_MS = 1;
const MAX_TIMEOUT_MS = 60_000;

export function validateRegistry(registry: readonly RegistryEntry[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const seenHookIds = new Set<string>();

  for (const entry of registry) {
    if (seenHookIds.has(entry.id)) {
      diagnostics.push({
        level: "error",
        code: "registry.duplicate_id",
        hookId: entry.id,
        message: `Duplicate hook ID: ${entry.id}`
      });
    }
    seenHookIds.add(entry.id);

    if (!HOOK_ID_PATTERN.test(entry.id)) {
      diagnostics.push({
        level: "error",
        code: "registry.invalid_id",
        hookId: entry.id,
        message: `Invalid hook ID: ${entry.id}`
      });
    }

    if (entry.timeoutMs < MIN_TIMEOUT_MS || entry.timeoutMs > MAX_TIMEOUT_MS) {
      diagnostics.push({
        level: "error",
        code: "registry.invalid_timeout",
        hookId: entry.id,
        message: `Invalid timeout for ${entry.id}`
      });
    }
  }

  return sortDiagnostics(diagnostics);
}

export function selectRegistryEntries(
  entries: readonly RegistryEntry[],
  envelope: HookEnvelope,
  config: HookPackConfig
): RegistrySelection {
  const diagnostics = unknownConfiguredHookDiagnostics(entries, config);

  if (!config.enabled) {
    return {
      entries: [],
      diagnostics
    };
  }

  const enabledHookIds = new Set(config.enabledHooks);
  const disabledHookIds = new Set(config.disabledHooks);
  const selectedEntries = entries.filter((entry) => {
    if (!entry.events.includes(envelope.eventName)) {
      return false;
    }

    if (disabledHookIds.has(entry.id)) {
      return false;
    }

    return config.enableAllHooksByDefault || entry.defaultEnabled || enabledHookIds.has(entry.id);
  });

  return {
    entries: selectedEntries,
    diagnostics
  };
}

function unknownConfiguredHookDiagnostics(
  registry: readonly RegistryEntry[],
  config: HookPackConfig
): readonly Diagnostic[] {
  const knownHookIds = new Set(registry.map((entry) => entry.id));
  const configuredHookIds = new Set([...config.enabledHooks, ...config.disabledHooks]);
  const diagnostics: Diagnostic[] = [];

  for (const hookId of configuredHookIds) {
    if (!knownHookIds.has(hookId)) {
      diagnostics.push({
        level: "error",
        code: "registry.unknown_hook_id",
        hookId,
        message: `Configured hook ID is not implemented: ${hookId}`
      });
    }
  }

  return sortDiagnostics(diagnostics);
}
