import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";

import { createReadPermissionTokenStore, type FileFingerprint } from "../../src/hooks/write-existing-file-guard/token-store.js";

const HOOK_ID = "write-existing-file-guard";

describe("write-existing-file-guard token store", () => {
  it("grantReadToken writes token file under expected hashed session and path structure", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });

      assert.equal(store.grantReadToken("session/one", canonicalPath, fingerprint), true);

      const tokenDir = join(dataDir, HOOK_ID, sha256("session/one"), sha256(canonicalPath));
      assert.equal(existsSync(tokenDir), true);
      const tokenFiles = readdirSync(tokenDir).filter((entry) => entry.endsWith(".json"));
      assert.equal(tokenFiles.length, 1);
      const tokenFile = tokenFiles[0];
      assert.ok(tokenFile !== undefined);
      const token = readJson(join(tokenDir, tokenFile));
      assert.equal(isRecord(token), true);
      const tokenRecord = token as Record<string, unknown>;
      assert.equal(tokenRecord.createdAt, 1_000);
      assert.equal(tokenRecord.touchedAt, 1_000);
    });
  });

  it("unsafe session ids are hashed before filesystem use and cannot delete parent state", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });
      const sentinel = join(dataDir, "sentinel.txt");
      writeFileSync(sentinel, "keep", "utf8");

      assert.equal(store.grantReadToken("..", canonicalPath, fingerprint), true);
      assert.equal(existsSync(join(dataDir, HOOK_ID, sha256(".."), sha256(canonicalPath))), true);
      assert.equal(readdirSync(join(dataDir, HOOK_ID)).includes(".."), false);

      store.deleteSession("..");

      assert.equal(existsSync(dataDir), true);
      assert.equal(existsSync(sentinel), true);
      assert.equal(existsSync(join(dataDir, HOOK_ID)), true);

      assert.equal(store.grantReadToken(".", canonicalPath, fingerprint), true);
      store.deleteSession(".");
      assert.equal(existsSync(join(dataDir, HOOK_ID)), true);
      assert.equal(readdirSync(join(dataDir, HOOK_ID)).includes("."), false);
      assert.equal(store.grantReadToken("a/b", canonicalPath, fingerprint), true);
      assert.equal(existsSync(join(dataDir, HOOK_ID, sha256("a/b"), sha256(canonicalPath))), true);
    });
  });

  it("consumeTokenAndInvalidateOtherSessions returns consumed once, missing second time", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "consumed");
      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "missing");
    });
  });

  it("consumeTokenAndInvalidateOtherSessions returns missing when no token exists", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "missing");
    });
  });

  it("lock acquisition failure returns locked", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const lockDir = join(dataDir, HOOK_ID, ".locks", sha256(canonicalPath));
      mkdirSync(lockDir, { recursive: true });
      writeFileSync(join(lockDir, "owner.json"), JSON.stringify({ pid: 999_999, createdAt: 1_000 }), "utf8");
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_001, staleLockMs: 30_000 });

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "locked");
    });
  });

  it("fresh ownerless lock dirs are not reaped before stale-lock TTL", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const lockDir = join(dataDir, HOOK_ID, ".locks", sha256(canonicalPath));
      mkdirSync(lockDir, { recursive: true });
      const freshLockDate = new Date(9_500);
      utimesSync(lockDir, freshLockDate, freshLockDate);
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 10_000, staleLockMs: 1_000 });

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "locked");
      assert.equal(existsSync(lockDir), true);
    });
  });

  it("consumeTokenAndInvalidateOtherSessions removes tokens from other sessions under same path lock", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);
      assert.equal(store.grantReadToken("session-two", canonicalPath, fingerprint), true);

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "consumed");

      assert.equal(existsSync(join(dataDir, HOOK_ID, ".locks", sha256(canonicalPath))), false);
      assert.equal(countJsonFiles(join(dataDir, HOOK_ID, sha256("session-two"), sha256(canonicalPath))), 0);
      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-two", canonicalPath, fingerprint), "missing");
    });
  });

  it("deleteSession removes entire session subtree", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);

      store.deleteSession("session-one");

      assert.equal(existsSync(join(dataDir, HOOK_ID, sha256("session-one"))), false);
    });
  });

  it("LRU trimming evicts oldest session and oldest path with small caps", () => {
    withStoreFixture(({ dataDir, rootDir }) => {
      const store = createReadPermissionTokenStore({
        pluginDataDir: dataDir,
        hookId: HOOK_ID,
        now: incrementingClock(1_000),
        maxTrackedSessions: 2,
        maxTrackedPathsPerSession: 2
      });
      const firstPath = materialize(rootDir, "first.txt", "first");
      const secondPath = materialize(rootDir, "second.txt", "second");
      const thirdPath = materialize(rootDir, "third.txt", "third");
      const firstFingerprint = makeFingerprint(firstPath);
      const secondFingerprint = makeFingerprint(secondPath);
      const thirdFingerprint = makeFingerprint(thirdPath);

      assert.equal(store.grantReadToken("kept-session", firstPath, firstFingerprint), true);
      assert.equal(store.grantReadToken("evicted-session", firstPath, firstFingerprint), true);
      assert.equal(store.grantReadToken("kept-session", secondPath, secondFingerprint), true);
      assert.equal(store.grantReadToken("kept-session", firstPath, firstFingerprint), true);
      assert.equal(store.grantReadToken("new-session", thirdPath, thirdFingerprint), true);
      assert.equal(store.grantReadToken("kept-session", thirdPath, thirdFingerprint), true);

      assert.equal(existsSync(join(dataDir, HOOK_ID, sha256("evicted-session"))), false);
      assert.notEqual(store.consumeTokenAndInvalidateOtherSessions("kept-session", firstPath, firstFingerprint), "missing");
      assert.equal(store.consumeTokenAndInvalidateOtherSessions("kept-session", secondPath, secondFingerprint), "missing");
      assert.notEqual(store.consumeTokenAndInvalidateOtherSessions("new-session", thirdPath, thirdFingerprint), "missing");
    });
  });

  it("successful consumes trim excess sessions after touching the consuming session", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 2_000, maxTrackedSessions: 1 });
      const olderSessionDir = join(dataDir, HOOK_ID, sha256("older-session"));
      mkdirSync(olderSessionDir, { recursive: true });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);
      mkdirSync(olderSessionDir, { recursive: true });

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "consumed");

      assert.equal(existsSync(olderSessionDir), false);
      assert.equal(existsSync(join(dataDir, HOOK_ID, sha256("session-one"))), true);
    });
  });

  it("token files don't contain raw canonical paths while session and path hashes are used for dirs", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);

      const tokenDir = join(dataDir, HOOK_ID, sha256("session-one"), sha256(canonicalPath));
      const tokenFile = readdirSync(tokenDir).find((entry) => entry.endsWith(".json"));
      assert.ok(tokenFile !== undefined);
      const tokenJson = readFileSync(join(tokenDir, tokenFile), "utf8");
      const allNames = listRelativeEntries(join(dataDir, HOOK_ID)).join("\n");
      assert.equal(tokenJson.includes(canonicalPath), false);
      assert.equal(tokenJson.includes(fingerprint.realpath), false);
      assert.equal(allNames.includes(canonicalPath), false);
      assert.equal(allNames.includes(fingerprint.realpath), false);
      assert.equal(allNames.includes("existing.txt"), false);
      assert.equal(existsSync(tokenDir), true);
    });
  });

  it("lock release preserves a fresh replacement lock after stale-lock retry", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const lockDir = join(dataDir, HOOK_ID, ".locks", sha256(canonicalPath));
      mkdirSync(lockDir, { recursive: true });
      writeFileSync(join(lockDir, "owner.json"), JSON.stringify({ pid: 999_999, createdAt: 1_000 }), "utf8");
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 10_000, staleLockMs: 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "consumed");

      mkdirSync(lockDir, { recursive: true });
      writeFileSync(join(lockDir, "owner.json"), JSON.stringify({ pid: 123_456, createdAt: 10_001, token: "fresh-owner" }), "utf8");
      const lockedStore = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 10_002, staleLockMs: 30_000 });
      assert.equal(lockedStore.invalidateForOverwrite(canonicalPath, undefined), "locked");
      assert.equal(existsSync(lockDir), true);
    });
  });

  it("stale lock dirs older than configured stale-lock TTL are removed and retried", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const lockDir = join(dataDir, HOOK_ID, ".locks", sha256(canonicalPath));
      mkdirSync(lockDir, { recursive: true });
      writeFileSync(join(lockDir, "owner.json"), JSON.stringify({ pid: 999_999, createdAt: 1_000 }), "utf8");
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 10_000, staleLockMs: 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "consumed");
      assert.equal(existsSync(lockDir), false);
    });
  });

  it("fingerprint mismatch returns stale and deletes the stale token", () => {
    withStoreFixture(({ dataDir, canonicalPath, fingerprint }) => {
      const store = createReadPermissionTokenStore({ pluginDataDir: dataDir, hookId: HOOK_ID, now: () => 1_000 });
      assert.equal(store.grantReadToken("session-one", canonicalPath, fingerprint), true);
      const staleFingerprint = { ...fingerprint, mtimeMs: fingerprint.mtimeMs + 1 };

      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, staleFingerprint), "stale");
      assert.equal(store.consumeTokenAndInvalidateOtherSessions("session-one", canonicalPath, fingerprint), "missing");
    });
  });

  it("missing pluginDataDir uses no-op store semantics", () => {
    const store = createReadPermissionTokenStore({ pluginDataDir: undefined, hookId: HOOK_ID, now: () => 1_000 });
    const fingerprint: FileFingerprint = { realpath: "/tmp/file", mtimeMs: 1, size: 1 };

    assert.equal(store.grantReadToken("session", "/tmp/file", fingerprint), false);
    assert.equal(store.consumeTokenAndInvalidateOtherSessions("session", "/tmp/file", fingerprint), "missing");
    assert.equal(store.invalidateForOverwrite("/tmp/file", "session"), "invalidated");
    assert.doesNotThrow(() => store.deleteSession("session"));
  });
});

interface StoreFixture {
  readonly rootDir: string;
  readonly dataDir: string;
  readonly canonicalPath: string;
  readonly fingerprint: FileFingerprint;
}

function withStoreFixture(run: (fixture: StoreFixture) => void): void {
  const rootDir = mkdtempSync(join(tmpdir(), "write-existing-file-guard-store-"));
  const dataDir = join(rootDir, "plugin-data");
  mkdirSync(dataDir, { recursive: true });
  const canonicalPath = materialize(rootDir, "existing.txt", "existing");
  try {
    run({ rootDir, dataDir, canonicalPath, fingerprint: makeFingerprint(canonicalPath) });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
}

function materialize(rootDir: string, relativePath: string, content: string): string {
  const filePath = join(rootDir, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

function makeFingerprint(filePath: string): FileFingerprint {
  const stats = statSync(filePath);
  return { realpath: filePath, mtimeMs: stats.mtimeMs, size: stats.size, dev: stats.dev, ino: stats.ino };
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
}

function countJsonFiles(directory: string): number {
  if (!existsSync(directory)) {
    return 0;
  }
  return readdirSync(directory).filter((entry) => entry.endsWith(".json")).length;
}

function listRelativeEntries(root: string): string[] {
  const entries: string[] = [];
  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = join(directory, entry.name);
      entries.push(relative(root, absolutePath));
      if (entry.isDirectory()) {
        visit(absolutePath);
      }
    }
  }
  visit(root);
  return entries;
}

function incrementingClock(start: number): () => number {
  let current = start;
  return () => {
    current += 1;
    return current;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
