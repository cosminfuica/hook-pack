// Ported from: docs/reference/hooks/rules-injector/rule-scan-cache.test.ts
// Adaptations:
// - bun:test -> node:test/node:assert/strict
// - in-memory createRuleScanCache assertions -> file-backed per-session scan cache through loadMatchingRules cache options
// - mocked scanner reuse case -> filesystem mutation proves cached candidate paths are reused until lifecycle cleanup removes scan-cache file
// Dropped reference cases:
// - None.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";

import { resolveRuntimeContext } from "../../src/core/runtime-context.js";
import { createRulesInjector } from "../../src/hooks/rules-injector/index.js";
import { createFileBackedRuleScanCache, loadMatchingRules } from "../../src/hooks/shared/rule-discovery.js";
import { makeLifecycleEnvelope, makePostToolEnvelope, withHookFixture } from "../helpers/hook-fixtures.js";

describe("createFileBackedRuleScanCache", () => {
  it("returns undefined before set, returns stored value, persists across instances, and clears entries", () => {
    const root = mkdtempSync(join(tmpdir(), "rule-scan-cache-"));
    try {
      const cachePath = join(root, "cache.json");
      const first = createFileBackedRuleScanCache(cachePath);
      const value = ["a", "b"];

      const initialValue = first.get("k1");
      first.set("k1", value);
      const second = createFileBackedRuleScanCache(cachePath);
      const storedValue = second.get("k1");
      second.clear();
      const clearedValue = first.get("k1");

      assert.equal(initialValue, undefined);
      assert.deepEqual(storedValue, value);
      assert.equal(clearedValue, undefined);
      assert.equal(existsSync(cachePath), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("treats malformed cache entries as misses", () => {
    const root = mkdtempSync(join(tmpdir(), "rule-scan-cache-invalid-"));
    try {
      const cachePath = join(root, "cache.json");
      writeFileSync(cachePath, '{"entries":{"k1":"not-an-array"}}\n', "utf8");
      const cache = createFileBackedRuleScanCache(cachePath);

      assert.equal(cache.get("k1"), undefined);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("loadMatchingRules with scan cache", () => {
  it("reuses cached directory scan paths for identical inputs", () => {
    const root = mkdtempSync(join(tmpdir(), "rule-scan-cache-load-"));
    try {
      const projectRoot = join(root, "project");
      const homeDir = join(root, "home");
      const cachePath = join(root, "scan-cache.json");
      mkdirSync(join(projectRoot, ".git"), { recursive: true });
      mkdirSync(homeDir, { recursive: true });
      const targetPath = writeFile(projectRoot, "src/index.ts", "export const value = 1;\n");
      const rulePath = writeFile(projectRoot, ".github/instructions/typescript.instructions.md", "---\napplyTo: src/**/*.ts\n---\nCached scan rule\n");
      const cache = createFileBackedRuleScanCache(cachePath);

      const first = loadMatchingRules({ projectRoot, targetPath, homedir: homeDir, includeUserRules: false, scanCache: cache });
      rmSync(rulePath, { force: true });
      const second = loadMatchingRules({ projectRoot, targetPath, homedir: homeDir, includeUserRules: false, scanCache: cache });

      assert.equal(first.length, 1);
      assert.equal(second.length, 0);
      assert.equal(existsSync(cachePath), true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("SessionEnd removes handler scan-cache file", async () => {
    await withHookFixture(async ({ cwd, dataDir }) => {
      writeFile(cwd, "package.json", "{}\n");
      writeFile(cwd, "src/index.ts", "export const value = 1;\n");
      writeFile(cwd, ".claude/rules/src.md", "---\napplyTo: src/**/*.ts\n---\nScan cache lifecycle rule\n");
      const hook = createRulesInjector();
      const context = resolveRuntimeContext(cwd, { CLAUDE_PLUGIN_DATA: dataDir });
      const cachePath = join(dataDir, "rules-injector", "scan-cache", "session-scan.json");

      await hook(makePostToolEnvelope("Read", "session-scan", cwd, { file_path: "src/index.ts" }, { content: "ok" }), context);
      assert.equal(existsSync(cachePath), true);

      await hook(makeLifecycleEnvelope("SessionEnd", "session-scan", cwd), context);
      assert.equal(existsSync(cachePath), false);
    });
  });
});

function writeFile(root: string, relativePath: string, content: string): string {
  const path = join(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  return path;
}
