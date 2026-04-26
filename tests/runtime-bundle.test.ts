import assert from "node:assert/strict";
import { chmodSync, cpSync, existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { describe, it } from "node:test";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "..", "..");
const bundledDispatchPath = resolve(repoRoot, "dist", "hook-pack-dispatch.mjs");

describe("runtime bundle", () => {
  it("build emits a bundled dispatcher artifact", () => {
    assert.equal(existsSync(bundledDispatchPath), true, "dist/hook-pack-dispatch.mjs must exist after npm run build");
    assert.ok(statSync(bundledDispatchPath).size > 1024, "dist/hook-pack-dispatch.mjs must be non-empty and larger than 1KB");
  });

  it("copied plugin runtime runs dispatch without node_modules", async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hook-pack-runtime-bundle-"));
    const tempPlugin = join(tempRoot, "plugin");
    try {
      cpSync(resolve(repoRoot, ".claude-plugin"), join(tempPlugin, ".claude-plugin"), { recursive: true });
      cpSync(resolve(repoRoot, "hooks"), join(tempPlugin, "hooks"), { recursive: true });
      cpSync(resolve(repoRoot, "dist"), join(tempPlugin, "dist"), { recursive: true });
      rmSync(join(tempPlugin, "dist", "src"), { recursive: true, force: true });
      rmSync(join(tempPlugin, "node_modules"), { recursive: true, force: true });
      chmodSync(join(tempPlugin, "hooks", "dispatch.sh"), 0o755);

      const result = await runDispatch(tempPlugin);

      assert.equal(existsSync(join(tempPlugin, "node_modules")), false, "smoke fixture must not include node_modules");
      assert.equal(existsSync(join(tempPlugin, "dist", "src")), false, "smoke fixture must not include compiled source fallback");
      assert.equal(result.exitCode, 0);
      assert.equal(result.stdout, "");
      assert.doesNotMatch(result.stderr, /ERR_MODULE_NOT_FOUND/);
      assert.equal(result.stderr, "");
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});

interface DispatchResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number | null;
}

function runDispatch(pluginRoot: string): Promise<DispatchResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("bash", [join(pluginRoot, "hooks", "dispatch.sh"), "PreToolUse"], {
      cwd: pluginRoot,
      env: dispatchEnvironment(pluginRoot),
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolvePromise({ stdout, stderr, exitCode });
    });
    child.stdin.end(JSON.stringify({
      hook_event_name: "PreToolUse",
      cwd: tmpdir(),
      session_id: "bundle-smoke",
      tool_name: "Bash",
      tool_input: { command: "echo" }
    }));
  });
}

function dispatchEnvironment(pluginRoot: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, CLAUDE_PLUGIN_ROOT: pluginRoot };
  delete env.NODE_PATH;
  return env;
}
