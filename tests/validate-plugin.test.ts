import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "..", "..");
const validatorPath = resolve(repoRoot, "scripts", "validate-plugin.mjs");
const validatorSource = readFileSync(validatorPath, "utf8");

interface ValidatorResult {
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

interface FixtureOptions {
  readonly runtimeArtifact?: boolean;
  readonly hookCommand?: string;
  readonly hookTimeout?: number;
  readonly registrySource?: string;
  readonly governanceSource?: string;
}

const defaultHookCommand = 'bash "${CLAUDE_PLUGIN_ROOT}/hooks/dispatch.sh" PreToolUse';
const emptyRegistrySource = "export const BUILT_IN_REGISTRY = [];\nconst unrelated = { id: \"not-a-stable-hook-id\" };\n";
const implementedHookRegistrySource =
  'export const BUILT_IN_REGISTRY = [{ id: "implemented-hook", events: [], runner: {}, timeoutMs: 10, defaultEnabled: false }];\n';
const duplicateHookRegistrySource =
  'export const BUILT_IN_REGISTRY = [{ id: "implemented-hook", events: [], runner: {}, timeoutMs: 10, defaultEnabled: false }, { id: "implemented-hook", events: [], runner: {}, timeoutMs: 10, defaultEnabled: false }];\n';
const emptyIdRegistrySource =
  'export const BUILT_IN_REGISTRY = [{ id: "", events: [], runner: {}, timeoutMs: 10, defaultEnabled: false }];\n';

function runValidator(scriptPath: string, cwd: string): Promise<ValidatorResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
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
      resolvePromise({ exitCode, stdout, stderr });
    });
  });
}

function createFixture(options: FixtureOptions = {}): string {
  const root = mkdtempSync(join(tmpdir(), "hook-pack-validator-"));
  mkdirSync(resolve(root, ".claude-plugin"), { recursive: true });
  mkdirSync(resolve(root, "hooks"), { recursive: true });
  mkdirSync(resolve(root, "scripts"), { recursive: true });
  mkdirSync(resolve(root, "dist"), { recursive: true });
  mkdirSync(resolve(root, "dist", "src", "core"), { recursive: true });

  writeJson(resolve(root, ".claude-plugin", "plugin.json"), {
    name: "hook-pack",
    version: "0.1.0",
    userConfig: {}
  });
  writeJson(resolve(root, "hooks", "hooks.json"), {
    hooks: {
      PreToolUse: [
        {
          hooks: [
            {
              type: "command",
              command: options.hookCommand ?? defaultHookCommand,
              timeout: options.hookTimeout ?? 10
            }
          ]
        }
      ]
    }
  });
  writeFileSync(resolve(root, "hooks", "dispatch.sh"), "#!/usr/bin/env bash\nset -euo pipefail\n", "utf8");
  chmodSync(resolve(root, "hooks", "dispatch.sh"), 0o755);
  writeFileSync(resolve(root, "scripts", "validate-plugin.mjs"), validatorSource, "utf8");
  if (options.runtimeArtifact !== false) {
    writeFileSync(resolve(root, "dist", "hook-pack-dispatch.mjs"), "export {};\n", "utf8");
  }
  writeFileSync(
    resolve(root, "dist", "src", "core", "registry.js"),
    options.registrySource ?? "export const BUILT_IN_REGISTRY = [];\n",
    "utf8"
  );
  if (options.governanceSource !== undefined) {
    mkdirSync(resolve(root, "docs", "architecture"), { recursive: true });
    writeFileSync(resolve(root, "docs", "architecture", "migration-governance.md"), options.governanceSource, "utf8");
  }
  return root;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function withFixture(options: FixtureOptions, run: (root: string) => Promise<void>): Promise<void> {
  const root = createFixture(options);
  try {
    await run(root);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

function governanceRecordForImplementedHook(sections: readonly string[]): string {
  return [
    "# Migration Governance",
    "",
    "## Migration Feasibility Record: implemented-hook",
    "",
    "Stable ID: implemented-hook",
    "Decision: portable",
    "",
    ...sections.flatMap((section) => [section, ""])
  ].join("\n");
}

function governanceRecord(parts: {
  readonly header?: string | undefined;
  readonly stableId?: string | undefined;
  readonly decision?: string | undefined;
  readonly sections?: readonly string[] | undefined;
}): string {
  return [
    "# Migration Governance",
    "",
    parts.header ?? "## Migration Feasibility Record: implemented-hook",
    "",
    parts.stableId ?? "Stable ID: implemented-hook",
    parts.decision ?? "Decision: portable",
    "",
    ...(parts.sections ?? [
      "### Reference source",
      "### State and lifecycle",
      "### Tests required before implementation",
      "### Orchestration neutrality"
    ]).flatMap((section) => [section, ""])
  ].join("\n");
}

describe("plugin validator", () => {
  it("accepts the foundation plugin scaffold", async () => {
    const result = await runValidator(validatorPath, repoRoot);

    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout.trim(), "hook-pack plugin validation passed");
    assert.equal(result.stderr, "");
  });

  it("fails when the runtime dispatch artifact is missing", async () => {
    await withFixture({ runtimeArtifact: false }, async (root) => {
      const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

      assert.notEqual(result.exitCode, 0);
      assert.equal(result.stdout, "");
      assert.match(result.stderr, /^- runtime dispatch artifact must exist at dist\/hook-pack-dispatch\.mjs/m);
    });
  });

  it("fails on unquoted dispatch command and wrong timeout", async () => {
    await withFixture(
      {
        hookCommand: "bash ${CLAUDE_PLUGIN_ROOT}/hooks/dispatch.sh PreToolUse",
        hookTimeout: 30
      },
      async (root) => {
        const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

        assert.notEqual(result.exitCode, 0);
        assert.equal(result.stdout, "");
        assert.match(
          result.stderr,
          /^- PreToolUse registration 0 hook 0 command must include "\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/dispatch\.sh"/m
        );
        assert.match(result.stderr, /^- PreToolUse registration 0 hook 0 timeout must be 10/m);
      }
    );
  });

  it("ignores unrelated id literals when BUILT_IN_REGISTRY is empty", async () => {
    await withFixture({ registrySource: emptyRegistrySource }, async (root) => {
      const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

      assert.equal(result.exitCode, 0);
      assert.equal(result.stdout.trim(), "hook-pack plugin validation passed");
      assert.equal(result.stderr, "");
    });
  });

  it("fails when implemented registry IDs lack stable ID governance docs", async () => {
    await withFixture(
      {
        registrySource: implementedHookRegistrySource
      },
      async (root) => {
        const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

        assert.notEqual(result.exitCode, 0);
        assert.equal(result.stdout, "");
        assert.match(
          result.stderr,
          /^- migration governance docs must exist when registry IDs are implemented at docs\/architecture\/migration-governance\.md/m
        );
      }
    );
  });

  it("fails when implemented registry IDs are empty or duplicated", async () => {
    const requiredSections = [
      "### Reference source",
      "### State and lifecycle",
      "### Tests required before implementation",
      "### Orchestration neutrality"
    ];

    await withFixture(
      {
        registrySource: emptyIdRegistrySource
      },
      async (root) => {
        const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

        assert.notEqual(result.exitCode, 0);
        assert.equal(result.stdout, "");
        assert.match(result.stderr, /^- registry artifact BUILT_IN_REGISTRY entries must include non-empty id/m);
      }
    );

    await withFixture(
      {
        registrySource: duplicateHookRegistrySource,
        governanceSource: governanceRecordForImplementedHook(requiredSections)
      },
      async (root) => {
        const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

        assert.notEqual(result.exitCode, 0);
        assert.equal(result.stdout, "");
        assert.match(result.stderr, /^- registry artifact BUILT_IN_REGISTRY must not contain duplicate id implemented-hook/m);
      }
    );
  });

  it("fails when implemented registry governance records lack required sections", async () => {
    const requiredSections = ["### Reference source", "### State and lifecycle", "### Tests required before implementation", "### Orchestration neutrality"];
    const missingCases = [
      {
        governanceSource: governanceRecord({ stableId: "Stable ID: other-hook" }),
        expected: "Stable ID: implemented-hook"
      },
      {
        governanceSource: governanceRecord({ decision: "Decision: redesign-needed" }),
        expected: "Decision: portable"
      },
      ...requiredSections.map((section) => ({
        governanceSource: governanceRecord({ sections: requiredSections.filter((candidate) => candidate !== section) }),
        expected: section
      }))
    ];

    for (const { governanceSource, expected } of missingCases) {
      await withFixture(
        {
          registrySource: implementedHookRegistrySource,
          governanceSource
        },
        async (root) => {
          const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

          assert.notEqual(result.exitCode, 0);
          assert.equal(result.stdout, "");
          assert.match(
            result.stderr,
            new RegExp(`^- migration governance record for implemented-hook must include ${escapeRegExp(expected)}`, "m")
          );
        }
      );
    }

    await withFixture(
      {
        registrySource: implementedHookRegistrySource,
        governanceSource: governanceRecordForImplementedHook(requiredSections)
      },
      async (root) => {
        const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

        assert.equal(result.exitCode, 0);
        assert.equal(result.stdout.trim(), "hook-pack plugin validation passed");
        assert.equal(result.stderr, "");
      }
    );
  });

  it("fails when implemented registry governance record header is missing", async () => {
    await withFixture(
      {
        registrySource: implementedHookRegistrySource,
        governanceSource: governanceRecord({ header: "## Migration Feasibility Record: other-hook" })
      },
      async (root) => {
        const result = await runValidator(resolve(root, "scripts", "validate-plugin.mjs"), root);

        assert.notEqual(result.exitCode, 0);
        assert.equal(result.stdout, "");
        assert.match(result.stderr, /^- migration governance docs must include ## Migration Feasibility Record: implemented-hook/m);
      }
    );
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
