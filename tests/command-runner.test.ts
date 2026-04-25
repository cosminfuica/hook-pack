import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { runCommand } from "../src/core/command-runner.js";

interface CommandRunnerProbe {
  readonly value: string;
  readonly cwd: string;
  readonly inheritedEnv: string;
  readonly requestEnv: string;
}

describe("safe command runner", () => {
  it("runs in requested cwd, pipes stdin JSON, merges env, and captures stdout", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "hook-pack-command-runner-"));
    const previousInheritedValue = process.env.SAFE_RUNNER_INHERITED_ENV;
    const script = `
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  const parsed = JSON.parse(input);
  process.stdout.write(JSON.stringify({
    value: parsed.value,
    cwd: process.cwd(),
    inheritedEnv: process.env.SAFE_RUNNER_INHERITED_ENV,
    requestEnv: process.env.SAFE_RUNNER_TEST_ENV
  }));
});
`;

    try {
      process.env.SAFE_RUNNER_INHERITED_ENV = "from-process-env";

      const result = await runCommand({
        command: [process.execPath, "-e", script],
        cwd,
        input: JSON.stringify({ value: "from-stdin" }),
        env: {
          SAFE_RUNNER_INHERITED_ENV: "overridden-by-request-env",
          SAFE_RUNNER_TEST_ENV: "from-request-env"
        },
        timeoutMs: 1_000,
        maxOutputBytes: 1_024
      });

      assert.equal(result.exitCode, 0);
      assert.equal(result.timedOut, false);
      assert.equal(result.stderr, "");
      const parsed = JSON.parse(result.stdout) as CommandRunnerProbe;
      assert.equal(parsed.value, "from-stdin");
      assert.equal(realpathSync(parsed.cwd), realpathSync(cwd));
      assert.equal(parsed.inheritedEnv, "overridden-by-request-env");
      assert.equal(parsed.requestEnv, "from-request-env");
    } finally {
      if (previousInheritedValue === undefined) {
        delete process.env.SAFE_RUNNER_INHERITED_ENV;
      } else {
        process.env.SAFE_RUNNER_INHERITED_ENV = previousInheritedValue;
      }
      rmSync(cwd, { force: true, recursive: true });
    }
  });

  it("passes shell metacharacters as literal arguments", async () => {
    const metacharacters = "literal; echo injected && exit 99 | cat";

    const result = await runCommand({
      command: [
        process.execPath,
        "-e",
        "process.stdout.write(JSON.stringify(process.argv.slice(1)));",
        metacharacters
      ],
      cwd: process.cwd(),
      input: "",
      env: {},
      timeoutMs: 1_000,
      maxOutputBytes: 1_024
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.timedOut, false);
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), [metacharacters]);
  });

  it("resolves safely when command exits before large stdin finishes writing", async () => {
    const result = await runCommand({
      command: [process.execPath, "-e", "process.exit(0);"],
      cwd: process.cwd(),
      input: "x".repeat(10 * 1024 * 1024),
      env: {},
      timeoutMs: 1_000,
      maxOutputBytes: 1_024
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.timedOut, false);
  });

  it("times out long-running commands", async () => {
    const result = await runCommand({
      command: [process.execPath, "-e", "setTimeout(() => {}, 10_000);"],
      cwd: process.cwd(),
      input: "",
      env: {},
      timeoutMs: 50,
      maxOutputBytes: 1_024
    });

    assert.equal(result.exitCode, 124);
    assert.equal(result.timedOut, true);
  });

  it("resolves timed-out commands that ignore SIGTERM with exitCode 124", async () => {
    const script = `
process.on("SIGTERM", () => {});
setTimeout(() => {}, 10_000);
`;

    const result = await runCommand({
      command: [process.execPath, "-e", script],
      cwd: process.cwd(),
      input: "",
      env: {},
      timeoutMs: 50,
      maxOutputBytes: 1_024
    });

    assert.equal(result.exitCode, 124);
    assert.equal(result.timedOut, true);
  });

  it("caps stdout and stderr", async () => {
    const script = `
process.stdout.write("o".repeat(100));
process.stderr.write("e".repeat(100));
`;

    const result = await runCommand({
      command: [process.execPath, "-e", script],
      cwd: process.cwd(),
      input: "",
      env: {},
      timeoutMs: 1_000,
      maxOutputBytes: 12
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.timedOut, false);
    assert.equal(result.stdout, "o".repeat(12));
    assert.equal(result.stderr, "e".repeat(12));
  });

  it("returns an error result for an empty command", async () => {
    const result = await runCommand({
      command: [],
      cwd: process.cwd(),
      input: "",
      env: {},
      timeoutMs: 1_000,
      maxOutputBytes: 1_024
    });

    assert.equal(result.exitCode, 1);
    assert.equal(result.timedOut, false);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "missing command");
  });
});
