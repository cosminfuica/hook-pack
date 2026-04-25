import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "..", "..");

function readJson(pathFromRoot: string): unknown {
  return JSON.parse(readFileSync(resolve(repoRoot, pathFromRoot), "utf8"));
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  assert.equal(typeof value, "object", `${label} must be an object`);
  assert.notEqual(value, null, `${label} must not be null`);
}

function assertString(value: unknown, label: string): asserts value is string {
  assert.equal(typeof value, "string", label);
}

describe("plugin scaffold", () => {
  it("declares a Claude Code plugin manifest with enablement userConfig", () => {
    const manifest = readJson(".claude-plugin/plugin.json");
    assertRecord(manifest, "plugin manifest");
    assert.equal(manifest.name, "hook-pack");
    const manifestVersion = manifest.version;
    assertString(manifestVersion, "plugin manifest version must be a string");
    assert.match(manifestVersion, /^\d+\.\d+\.\d+$/);
    assertRecord(manifest.userConfig, "plugin manifest userConfig");
    assertRecord(manifest.userConfig.enabled_hooks, "enabled_hooks config");
    assertRecord(manifest.userConfig.disabled_hooks, "disabled_hooks config");
    assertRecord(manifest.userConfig.enable_all_hooks_by_default, "enable_all_hooks_by_default config");
  });

  it("registers native Claude Code hook events through the plugin hooks wrapper", () => {
    const config = readJson("hooks/hooks.json");
    assertRecord(config, "hooks config");
    assert.equal(typeof config.description, "string");
    assertRecord(config.hooks, "hooks wrapper");
    const hooksConfig = config.hooks;

    const eventNames = [
      "SessionStart",
      "UserPromptSubmit",
      "PreToolUse",
      "PostToolUse",
      "Stop",
      "SubagentStop",
      "PreCompact",
      "Notification"
    ];

    for (const eventName of eventNames) {
      const registrations = hooksConfig[eventName];
      assert.ok(Array.isArray(registrations), `${eventName} must be registered`);
      assert.equal(registrations.length, 1, `${eventName} should use one dispatcher registration`);
      const registration = registrations[0] as Record<string, unknown>;
      assert.ok(Array.isArray(registration.hooks), `${eventName} registration must contain hooks array`);
      assert.equal(registration.hooks.length, 1, `${eventName} registration should use one command hook`);
      const hook = registration.hooks[0] as Record<string, unknown>;
      assert.equal(hook.type, "command");
      assert.equal(hook.timeout, 10);
      const hookCommand = hook.command;
      assertString(hookCommand, `${eventName} command must be a string`);
      assert.match(hookCommand, /^bash "\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/dispatch\.sh" /);
      assert.match(hookCommand, new RegExp(`${eventName}$`));
    }
  });

  it("provides an executable dispatcher wrapper without storing logic in hooks.json", () => {
    const dispatchPath = resolve(repoRoot, "hooks/dispatch.sh");
    assert.ok(existsSync(dispatchPath), "hooks/dispatch.sh must exist");
    assert.ok(statSync(dispatchPath).mode & 0o111, "hooks/dispatch.sh must be executable");
    const script = readFileSync(dispatchPath, "utf8");
    assert.match(script, /set -euo pipefail/);
    assert.match(script, /CLAUDE_PLUGIN_ROOT/);
    assert.match(script, /dist\/src\/cli\/dispatch\.js/);
  });
});
