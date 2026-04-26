// Ported from: docs/reference/hooks/rules-injector/cache.test.ts
// Adaptations:
// - bun:test -> node:test/node:assert/strict
// - in-memory session cache store -> file-backed parsed-rule cache under CLAUDE_PLUGIN_DATA
// - reference session-cache behavior moved to handler/storage tests because native migration stores session state with HookEnvelope sessions
// Dropped reference cases:
// - None.

import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { createParsedRuleCache, type ParsedRuleCacheEntry } from "../../src/hooks/rules-injector/parsed-rule-cache.js";

describe("createParsedRuleCache", () => {
  it("persists parsed entries across cache instances when realpath, mtimeMs, and size are stable", () => {
    withCacheFixture((dataDir) => {
      const entry = makeEntry(1000, 13, "cached body");
      const realpath = "/project/.claude/rules/a.md";

      const firstCache = createParsedRuleCache({ pluginDataDir: dataDir });
      const secondCache = createParsedRuleCache({ pluginDataDir: dataDir });

      assert.equal(firstCache.store(realpath, entry), true);
      assert.deepEqual(secondCache.load(realpath, 1000, 13), entry);
    });
  });

  it("invalidates parsed entries when mtimeMs changes", () => {
    withCacheFixture((dataDir) => {
      const cache = createParsedRuleCache({ pluginDataDir: dataDir });
      const realpath = "/project/.claude/rules/a.md";

      assert.equal(cache.store(realpath, makeEntry(1000, 13, "cached body")), true);

      assert.equal(cache.load(realpath, 2000, 13), undefined);
    });
  });

  it("invalidates parsed entries when size changes", () => {
    withCacheFixture((dataDir) => {
      const cache = createParsedRuleCache({ pluginDataDir: dataDir });
      const realpath = "/project/.claude/rules/a.md";

      assert.equal(cache.store(realpath, makeEntry(1000, 13, "cached body")), true);

      assert.equal(cache.load(realpath, 1000, 21), undefined);
    });
  });

  it("no-ops without pluginDataDir", () => {
    const cache = createParsedRuleCache({ pluginDataDir: undefined });

    assert.equal(cache.load("/project/rule.md", 1, 1), undefined);
    assert.equal(cache.store("/project/rule.md", makeEntry(1, 1, "body")), false);
  });

  it("returns false instead of throwing when writes fail", () => {
    withCacheFixture((dataDir) => {
      const fileAsDataDir = join(dataDir, "not-a-directory");
      writeFileSync(fileAsDataDir, "file", "utf8");
      const cache = createParsedRuleCache({ pluginDataDir: fileAsDataDir });

      assert.equal(cache.store("/project/rule.md", makeEntry(1, 1, "body")), false);
    });
  });
});

function withCacheFixture(run: (dataDir: string) => void): void {
  const dataDir = mkdtempSync(join(tmpdir(), "rules-cache-"));
  try {
    run(dataDir);
  } finally {
    rmSync(dataDir, { recursive: true, force: true });
  }
}

function makeEntry(mtimeMs: number, size: number, body: string): ParsedRuleCacheEntry {
  return {
    mtimeMs,
    size,
    metadata: { globs: "**/*.ts" },
    body
  };
}
