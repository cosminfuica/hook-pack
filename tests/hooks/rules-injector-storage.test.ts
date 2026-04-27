// Native Claude Code adaptations:
// - bun:test -> node:test/node:assert/strict
// - RULES_INJECTOR_STORAGE global path -> CLAUDE_PLUGIN_DATA/rules-injector/sessions session files
// - save/load direct API assertions -> handler behavior proving per-session persisted dedupe isolation
// Dropped cases:
// - None.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createRulesInjector } from "../../src/hooks/rules-injector/index.js";
import { encodeSessionStateKey } from "../../src/hooks/shared/state-store.js";
import { makePostToolEnvelope, withHookFixture, writeFixtureFile } from "../helpers/hook-fixtures.js";

const HOOK_ID = "rules-injector";

describe("rules-injector storage", () => {
  it("persists dedupe state per session without leaking between sessions", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      mkdirSync(join(cwd, ".claude", "rules"), { recursive: true });
      writeFixtureFile(join(cwd, "package.json"), "{}\n");
      writeFixtureFile(join(cwd, "src", "a.ts"), "export const a = 1;\n");
      writeFixtureFile(join(cwd, ".claude", "rules", "typescript.md"), "---\napplyTo: src/**/*.ts\n---\nTypeScript rules\n");
      const hook = createRulesInjector();
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const envelopeA = makePostToolEnvelope("Read", "session-a", cwd, { file_path: join(cwd, "src", "a.ts") }, { content: "read ok" });
      const envelopeB = makePostToolEnvelope("Read", "session-b", cwd, { file_path: join(cwd, "src", "a.ts") }, { content: "read ok" });

      const firstA = await hook(envelopeA, context);
      const firstB = await hook(envelopeB, context);
      const secondA = await hook(envelopeA, context);
      const secondB = await hook(envelopeB, context);

      assert.match(firstA.additionalContext ?? "", /TypeScript rules/);
      assert.match(firstB.additionalContext ?? "", /TypeScript rules/);
      assert.deepEqual(secondA, { hookId: HOOK_ID });
      assert.deepEqual(secondB, { hookId: HOOK_ID });
      assert.equal(existsSync(sessionStatePath(dataDir, "session-a")), true);
      assert.equal(existsSync(sessionStatePath(dataDir, "session-b")), true);
      assert.match(readFileSync(sessionStatePath(dataDir, "session-a"), "utf8"), /injectedRealpaths/);
      assert.match(readFileSync(sessionStatePath(dataDir, "session-b"), "utf8"), /injectedContentHashes/);
    });
  });

  it("recovers malformed session state by treating it as empty", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      mkdirSync(join(cwd, ".claude", "rules"), { recursive: true });
      writeFixtureFile(join(cwd, "package.json"), "{}\n");
      writeFixtureFile(join(cwd, "src", "a.ts"), "export const a = 1;\n");
      writeFixtureFile(join(cwd, ".claude", "rules", "typescript.md"), "---\napplyTo: src/**/*.ts\n---\nRecovered rules\n");
      mkdirSync(dirname(sessionStatePath(dataDir, "session-corrupt")), { recursive: true });
      writeFixtureFile(
        sessionStatePath(dataDir, "session-corrupt"),
        `${JSON.stringify({ version: 1, payload: { injectedRealpaths: 42, injectedContentHashes: { bad: true } } })}\n`
      );
      const hook = createRulesInjector();
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });

      const result = await hook(makePostToolEnvelope("Read", "session-corrupt", cwd, { file_path: join(cwd, "src", "a.ts") }, { content: "read ok" }), context);

      assert.match(result.additionalContext ?? "", /Recovered rules/);
      assert.match(readFileSync(sessionStatePath(dataDir, "session-corrupt"), "utf8"), /injectedRealpaths/);
    });
  });
});

function sessionStatePath(dataDir: string, sessionId: string): string {
  return join(dataDir, "rules-injector", "sessions", `${encodeSessionStateKey(sessionId)}.json`);
}
