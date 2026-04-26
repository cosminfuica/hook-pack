// Ported/adapted from: docs/reference/hooks/comment-checker/pending-calls.ts and pending-calls.test.ts
// Adaptations:
// - bun:test -> node:test/node:assert/strict
// - in-memory pending map -> per-session plugin-data files under CLAUDE_PLUGIN_DATA
// - pending call TTL preserved at 60_000ms
// - state contains only checker metadata; no tool output or transcript payloads
// - patch-tool reference behavior consulted but dropped as non-portable per docs/architecture/comment-checker-apply-patch-verification.md

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { createPendingCommentStore, COMMENT_CHECKER_PENDING_TTL_MS, type PendingCommentCheck, type PendingCommentEdit } from "../../src/hooks/comment-checker/pending-store.js";

interface PendingCommentCheckWithRawPayload extends PendingCommentCheck {
  readonly content?: string | undefined;
  readonly oldString?: string | undefined;
  readonly newString?: string | undefined;
  readonly edits?: readonly PendingCommentEdit[] | undefined;
  readonly old_string?: string | undefined;
  readonly new_string?: string | undefined;
}

describe("comment-checker pending store", () => {
  it("persists pending calls under plugin-data and take removes the token", () => {
    withPendingFixture((dataDir) => {
      const store = createPendingCommentStore({ pluginDataDir: dataDir });
      const pending = makePending({ key: "call-1", sessionId: "session/one" });

      assert.equal(store.put(pending.sessionId, pending), true);

      const pendingRoot = join(dataDir, "comment-checker", "pending");
      assert.equal(existsSync(pendingRoot), true);
      assert.equal(readAllFiles(pendingRoot).length, 1);
      assert.equal(readAllFiles(pendingRoot)[0]?.includes("call-1"), false);

      assert.deepEqual(store.take(pending.sessionId, pending.key, pending.createdAt), pending);
      assert.equal(readAllFiles(pendingRoot).length, 0);
      assert.equal(store.take(pending.sessionId, pending.key, pending.createdAt), undefined);
    });
  });

  it("treats expired pending calls as missing and removes stale files", () => {
    withPendingFixture((dataDir) => {
      const store = createPendingCommentStore({ pluginDataDir: dataDir });
      const pending = makePending({ key: "stale-call", createdAt: 1_000 });

      assert.equal(store.put(pending.sessionId, pending), true);

      assert.equal(store.take(pending.sessionId, pending.key, 1_000 + COMMENT_CHECKER_PENDING_TTL_MS + 1), undefined);
      assert.equal(readAllFiles(join(dataDir, "comment-checker", "pending")).length, 0);
    });
  });

  it("cleanupStale removes only expired entries for one session", () => {
    withPendingFixture((dataDir) => {
      const store = createPendingCommentStore({ pluginDataDir: dataDir });
      const stale = makePending({ key: "stale", createdAt: 1_000, sessionId: "session-a" });
      const fresh = makePending({ key: "fresh", createdAt: 2_000, sessionId: "session-a" });
      const other = makePending({ key: "other", createdAt: 1_000, sessionId: "session-b" });

      assert.equal(store.put(stale.sessionId, stale), true);
      assert.equal(store.put(fresh.sessionId, fresh), true);
      assert.equal(store.put(other.sessionId, other), true);

      store.cleanupStale("session-a", 1_000 + COMMENT_CHECKER_PENDING_TTL_MS + 1);

      assert.equal(store.take(stale.sessionId, stale.key, 2_000), undefined);
      assert.deepEqual(store.take(fresh.sessionId, fresh.key, 2_000), fresh);
      assert.deepEqual(store.take(other.sessionId, other.key, 2_000), other);
    });
  });

  it("deleteSession removes pending calls for that session only", () => {
    withPendingFixture((dataDir) => {
      const store = createPendingCommentStore({ pluginDataDir: dataDir });
      const first = makePending({ key: "first", sessionId: "session-a" });
      const second = makePending({ key: "second", sessionId: "session-b" });

      assert.equal(store.put(first.sessionId, first), true);
      assert.equal(store.put(second.sessionId, second), true);
      store.deleteSession("session-a");

      assert.equal(store.take(first.sessionId, first.key, 1_000), undefined);
      assert.deepEqual(store.take(second.sessionId, second.key, 1_000), second);
    });
  });

  it("missing plugin data fails open without writing state", () => {
    const store = createPendingCommentStore({ pluginDataDir: undefined });
    const pending = makePending({ key: "missing-data" });

    assert.equal(store.put(pending.sessionId, pending), false);
    assert.equal(store.take(pending.sessionId, pending.key, pending.createdAt), undefined);
  });

  it("stored JSON contains no unrelated tool output or transcript fields", () => {
    withPendingFixture((dataDir) => {
      const store = createPendingCommentStore({ pluginDataDir: dataDir });
      const pending = makePending({ key: "minimal-fields" });

      assert.equal(store.put(pending.sessionId, pending), true);
      const files = readAllFiles(join(dataDir, "comment-checker", "pending"));
      assert.equal(files.length, 1);
      const json = readFileSync(files[0] ?? "", "utf8");

      assert.match(json, /"filePath"/);
      assert.doesNotMatch(json, /toolResponse|tool_output|transcript|stdout|stderr/);
    });
  });

  it("persists and returns sanitized metadata without raw payload text", () => {
    withPendingFixture((dataDir) => {
      const store = createPendingCommentStore({ pluginDataDir: dataDir });
      const rawSentinel = "RAW_PAYLOAD_SENTINEL_DO_NOT_STORE";
      const pending: PendingCommentCheckWithRawPayload = {
        ...makePending({
          key: "raw-payload",
          toolName: "multiedit"
        }),
        content: `content ${rawSentinel}`,
        oldString: `oldString ${rawSentinel}`,
        newString: `newString ${rawSentinel}`,
        edits: [{ old_string: `edit-old ${rawSentinel}`, new_string: `edit-new ${rawSentinel}` }],
        old_string: `snake-old ${rawSentinel}`,
        new_string: `snake-new ${rawSentinel}`
      };

      assert.equal(store.put(pending.sessionId, pending), true);
      const files = readAllFiles(join(dataDir, "comment-checker", "pending"));
      assert.equal(files.length, 1);
      const json = readFileSync(files[0] ?? "", "utf8");

      assert.doesNotMatch(json, /content|oldString|newString|edits|old_string|new_string/);
      assert.doesNotMatch(json, new RegExp(rawSentinel));
      assert.deepEqual(store.take(pending.sessionId, pending.key, pending.createdAt), {
        key: "raw-payload",
        toolName: "multiedit",
        sessionId: "session-1",
        filePath: "/workspace/src/a.ts",
        createdAt: 1_000
      });
    });
  });
});

function withPendingFixture(run: (dataDir: string) => void): void {
  const dataDir = mkdtempSync(join(tmpdir(), "comment-checker-pending-data-"));
  try {
    run(dataDir);
  } finally {
    rmSync(dataDir, { recursive: true, force: true });
  }
}

function makePending(overrides: Partial<PendingCommentCheck>): PendingCommentCheck {
  return {
    key: "call-1",
    toolName: "write",
    sessionId: "session-1",
    filePath: "/workspace/src/a.ts",
    createdAt: 1_000,
    ...overrides
  };
}

function readAllFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}
