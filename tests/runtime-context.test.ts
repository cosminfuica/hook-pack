import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { resolveRuntimeContext } from "../src/core/runtime-context.js";

describe("runtime context", () => {
  it("uses CLAUDE_PLUGIN_DATA as the persistent state root", () => {
    const dataDir = mkdtempSync(join(tmpdir(), "hook-pack-runtime-"));
    try {
      const context = resolveRuntimeContext("/workspace", { CLAUDE_PLUGIN_DATA: dataDir });
      assert.equal(context.pluginDataDir, dataDir);
      assert.equal(context.cwd, "/workspace");
      assert.equal(context.debug, false);
      assert.equal(context.userConfig.maxContextChars, 20_000);
      assert.equal(context.userConfig.includeUserRules, false);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it("marks plugin data unavailable when CLAUDE_PLUGIN_DATA is missing", () => {
    const context = resolveRuntimeContext("/workspace", {});
    assert.equal(context.pluginDataDir, undefined);
  });

  it("enables debug mode from HOOK_PACK_DEBUG", () => {
    assert.equal(resolveRuntimeContext("/workspace", { HOOK_PACK_DEBUG: "true" }).debug, true);
    assert.equal(resolveRuntimeContext("/workspace", { HOOK_PACK_DEBUG: "1" }).debug, true);
  });

  it("accepts userConfig overrides", () => {
    const context = resolveRuntimeContext("/workspace", {}, Date.now, {
      maxContextChars: 50_000,
      includeUserRules: true
    });
    assert.equal(context.userConfig.maxContextChars, 50_000);
    assert.equal(context.userConfig.includeUserRules, true);
  });

  it("exposes env and now on the runtime context", () => {
    const env = { HOME: "/home/test", PATH: "/bin" };
    const now = () => 123_456;
    const context = resolveRuntimeContext("/workspace", env, now);

    assert.equal(context.env, env);
    assert.equal(context.now, now);
    assert.equal(context.now(), 123_456);
  });
});
