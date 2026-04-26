import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createWriteExistingFileGuard } from "../../src/hooks/write-existing-file-guard/index.js";
import { makePostToolEnvelope, runNodeScript, withHookFixture, writeFixtureFile } from "../helpers/hook-fixtures.js";

const BLOCK_MESSAGE = "File already exists. Use edit tool instead.";
const testDir = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(testDir, "..", "..");

describe("write-existing-file-guard cross-process token consumption", () => {
  it("allows exactly one process to consume one read token", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const target = join(cwd, "src", "a.ts");
      writeFixtureFile(target, "export const a = 1;\n");
      await grantRead(cwd, dataDir, target, "session-1");

      const [left, right] = await Promise.all([
        runNodeScript(childWriteScript({ cwd, dataDir, target, sessionId: "session-1" })),
        runNodeScript(childWriteScript({ cwd, dataDir, target, sessionId: "session-1" }))
      ]);
      const decisions = [parseChildResult(left), parseChildResult(right)];

      assert.deepEqual([left.exitCode, right.exitCode], [0, 0]);
      assert.equal(decisions.filter((decision) => decision.permissionDecision === "allow").length, 1);
      assert.equal(decisions.filter((decision) => decision.permissionDecision === "deny" && decision.message === BLOCK_MESSAGE).length, 1);
    });
  });

  it("allows exactly one session to consume tokens for the same path", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      const target = join(cwd, "src", "a.ts");
      writeFixtureFile(target, "export const a = 1;\n");
      await grantRead(cwd, dataDir, target, "session-1");
      await grantRead(cwd, dataDir, target, "session-2");

      const [left, right] = await Promise.all([
        runNodeScript(childWriteScript({ cwd, dataDir, target, sessionId: "session-1" })),
        runNodeScript(childWriteScript({ cwd, dataDir, target, sessionId: "session-2" }))
      ]);
      const decisions = [parseChildResult(left), parseChildResult(right)];

      assert.deepEqual([left.exitCode, right.exitCode], [0, 0]);
      assert.equal(decisions.filter((decision) => decision.permissionDecision === "allow").length, 1);
      assert.equal(decisions.filter((decision) => decision.permissionDecision === "deny" && decision.message === BLOCK_MESSAGE).length, 1);
    });
  });
});

interface ChildDecision {
  readonly permissionDecision?: string | undefined;
  readonly message?: string | undefined;
}

async function grantRead(cwd: string, dataDir: string, target: string, sessionId: string): Promise<void> {
  const result = await createWriteExistingFileGuard()(makePostToolEnvelope("Read", sessionId, cwd, { file_path: target }, { content: "read ok" }), resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir }));
  assert.deepEqual(result, { hookId: "write-existing-file-guard" });
}

function childWriteScript(params: { readonly cwd: string; readonly dataDir: string; readonly target: string; readonly sessionId: string }): string {
  const runtimeContextModule = resolve(distRoot, "src/core/runtime-context.js");
  const guardModule = resolve(distRoot, "src/hooks/write-existing-file-guard/index.js");
  return `
    import { resolveRuntimeContext } from ${JSON.stringify(runtimeContextModule)};
    import { createWriteExistingFileGuard } from ${JSON.stringify(guardModule)};
    const envelope = {
      eventName: "PreToolUse",
      sessionId: ${JSON.stringify(params.sessionId)},
      cwd: ${JSON.stringify(params.cwd)},
      raw: { hook_event_name: "PreToolUse", cwd: ${JSON.stringify(params.cwd)}, session_id: ${JSON.stringify(params.sessionId)}, tool_name: "Write", tool_input: { file_path: ${JSON.stringify(params.target)}, content: "updated" } },
      toolName: "Write",
      toolInput: { file_path: ${JSON.stringify(params.target)}, content: "updated" },
      toolResponse: undefined,
      userPrompt: undefined
    };
    const context = resolveRuntimeContext(${JSON.stringify(params.cwd)}, { CLAUDE_PLUGIN_DATA: ${JSON.stringify(params.dataDir)} });
    const result = await createWriteExistingFileGuard()(envelope, context);
    process.stdout.write(JSON.stringify(result));
  `;
}

function parseChildResult(result: { readonly stdout: string; readonly stderr: string; readonly exitCode: number | null }): ChildDecision {
  assert.equal(result.stderr, "");
  const parsed = JSON.parse(result.stdout) as ChildDecision;
  return parsed;
}
