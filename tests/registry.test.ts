import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { HookPackConfig } from "../src/core/config.js";
import { sortDiagnostics, type Diagnostic } from "../src/core/diagnostics.js";
import type { HookEnvelope } from "../src/core/events.js";
import {
  BUILT_IN_REGISTRY,
  selectRegistryEntries,
  validateRegistry,
  type RegistryEntry
} from "../src/core/registry.js";

describe("hook registry", () => {
  const baseConfig: HookPackConfig = {
    enabled: true,
    enableAllHooksByDefault: false,
    enabledHooks: [],
    disabledHooks: [],
    maxContextChars: 20_000,
    includeUserRules: false
  };

  const baseEnvelope: HookEnvelope = {
    eventName: "PreToolUse",
    sessionId: "session-1",
    cwd: "/workspace",
    raw: { hook_event_name: "PreToolUse", cwd: "/workspace", tool_name: "Bash" },
    toolName: "Bash",
    toolInput: {},
    toolResponse: undefined,
    userPrompt: undefined
  };

  it("starts with no built-in entries", () => {
    assert.deepEqual(BUILT_IN_REGISTRY, []);
  });

  it("sorts diagnostics by optional hook ID and code", () => {
    const diagnostics: readonly Diagnostic[] = [
      { level: "info", code: "registry.z", hookId: "beta", message: "later hook" },
      { level: "warn", code: "registry.b", message: "no hook second" },
      { level: "error", code: "registry.a", hookId: "beta", message: "same hook earlier code" },
      { level: "error", code: "registry.a", message: "no hook first" }
    ];

    assert.deepEqual(sortDiagnostics(diagnostics), [
      { level: "error", code: "registry.a", message: "no hook first" },
      { level: "warn", code: "registry.b", message: "no hook second" },
      { level: "error", code: "registry.a", hookId: "beta", message: "same hook earlier code" },
      { level: "info", code: "registry.z", hookId: "beta", message: "later hook" }
    ]);
  });

  it("rejects duplicate hook IDs with stable diagnostic codes", () => {
    const registry = [makeEntry("duplicate-hook"), makeEntry("duplicate-hook")];

    assert.deepEqual(validateRegistry(registry), [
      {
        level: "error",
        code: "registry.duplicate_id",
        hookId: "duplicate-hook",
        message: "Duplicate hook ID: duplicate-hook"
      }
    ]);
  });

  it("rejects invalid hook IDs", () => {
    const registry = [
      makeEntry("bad_id"),
      makeEntry("starts--double-hyphen"),
      makeEntry("ends-with-")
    ];

    assert.deepEqual(validateRegistry(registry), [
      {
        level: "error",
        code: "registry.invalid_id",
        hookId: "bad_id",
        message: "Invalid hook ID: bad_id"
      },
      {
        level: "error",
        code: "registry.invalid_id",
        hookId: "ends-with-",
        message: "Invalid hook ID: ends-with-"
      },
      {
        level: "error",
        code: "registry.invalid_id",
        hookId: "starts--double-hyphen",
        message: "Invalid hook ID: starts--double-hyphen"
      }
    ]);
  });

  it("rejects invalid timeouts below one and above sixty seconds", () => {
    const registry = [makeEntry("too-low", { timeoutMs: 0 }), makeEntry("too-high", { timeoutMs: 60_001 })];

    assert.deepEqual(validateRegistry(registry), [
      {
        level: "error",
        code: "registry.invalid_timeout",
        hookId: "too-high",
        message: "Invalid timeout for too-high"
      },
      {
        level: "error",
        code: "registry.invalid_timeout",
        hookId: "too-low",
        message: "Invalid timeout for too-low"
      }
    ]);
  });

  it("selects only enabled entries matching the current event", () => {
    const defaultDisabled = makeEntry("default-disabled", { events: ["PreToolUse"], defaultEnabled: false });
    const defaultEnabled = makeEntry("default-enabled", { events: ["PreToolUse"], defaultEnabled: true });
    const wrongEvent = makeEntry("wrong-event", { events: ["Stop"], defaultEnabled: true });
    const registry = [defaultDisabled, defaultEnabled, wrongEvent];
    const config: HookPackConfig = {
      ...baseConfig,
      enabledHooks: ["default-disabled"]
    };

    assert.deepEqual(selectRegistryEntries(registry, baseEnvelope, config), {
      entries: [defaultDisabled, defaultEnabled],
      diagnostics: []
    });
  });

  it("lets disabled hook IDs win over default and explicit enablement", () => {
    const registry = [
      makeEntry("default-enabled", { defaultEnabled: true }),
      makeEntry("explicitly-enabled", { defaultEnabled: false })
    ];
    const config: HookPackConfig = {
      ...baseConfig,
      enabledHooks: ["explicitly-enabled", "default-enabled"],
      disabledHooks: ["default-enabled", "explicitly-enabled"]
    };

    assert.deepEqual(selectRegistryEntries(registry, baseEnvelope, config), {
      entries: [],
      diagnostics: []
    });
  });

  it("reports unknown configured hook IDs from enabled and disabled lists", () => {
    const registry = [makeEntry("known-hook")];
    const config: HookPackConfig = {
      ...baseConfig,
      enabledHooks: ["missing-enabled"],
      disabledHooks: ["missing-disabled"]
    };

    assert.deepEqual(selectRegistryEntries(registry, baseEnvelope, config), {
      entries: [],
      diagnostics: expectedUnknownHookDiagnostics()
    });
  });

  it("reports unknown configured hook IDs while globally disabled", () => {
    const registry = [makeEntry("known-hook")];
    const config: HookPackConfig = {
      enabled: false,
      enableAllHooksByDefault: true,
      enabledHooks: ["missing-enabled"],
      disabledHooks: ["missing-disabled"],
      maxContextChars: 20_000,
      includeUserRules: false
    };

    assert.deepEqual(selectRegistryEntries(registry, baseEnvelope, config), {
      entries: [],
      diagnostics: expectedUnknownHookDiagnostics()
    });
  });

  it("uses enableAllHooksByDefault without ignoring global disabled state", () => {
    const defaultDisabled = makeEntry("default-disabled", { defaultEnabled: false });
    const defaultEnabled = makeEntry("default-enabled", { defaultEnabled: true });
    const registry = [defaultDisabled, defaultEnabled];
    const globallyDisabledConfig: HookPackConfig = {
      enabled: false,
      enableAllHooksByDefault: true,
      enabledHooks: ["default-disabled"],
      disabledHooks: [],
      maxContextChars: 20_000,
      includeUserRules: false
    };

    assert.deepEqual(selectRegistryEntries(registry, baseEnvelope, globallyDisabledConfig), {
      entries: [],
      diagnostics: []
    });

    assert.deepEqual(
      selectRegistryEntries(registry, baseEnvelope, { ...globallyDisabledConfig, enabled: true }),
      {
        entries: registry,
        diagnostics: []
      }
    );
  });
});

function makeEntry(
  id: string,
  override: Partial<Pick<RegistryEntry, "events" | "defaultEnabled" | "timeoutMs" | "runner">> = {}
): RegistryEntry {
  return {
    id,
    events: override.events ?? ["PreToolUse"],
    defaultEnabled: override.defaultEnabled ?? false,
    runner: override.runner ?? {
      kind: "internal",
      handlerId: "registry-test-handler"
    },
    timeoutMs: override.timeoutMs ?? 1000
  };
}

function expectedUnknownHookDiagnostics(): Diagnostic[] {
  return [
    {
      level: "error",
      code: "registry.unknown_hook_id",
      hookId: "missing-disabled",
      message: "Configured hook ID is not implemented: missing-disabled"
    },
    {
      level: "error",
      code: "registry.unknown_hook_id",
      hookId: "missing-enabled",
      message: "Configured hook ID is not implemented: missing-enabled"
    }
  ];
}
