import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { deleteHookSessionState } from "../../src/hooks/shared/lifecycle-state.js";
import { createJsonStateStore, encodeSessionStateKey } from "../../src/hooks/shared/state-store.js";
import { runNodeScript, withHookFixture } from "../helpers/hook-fixtures.js";

describe("shared JSON state store", () => {
  it("stores versioned JSON state under plugin data dir keyed by hook id and session id", async () => {
    await withHookFixture(({ dataDir }) => {
      const store = createJsonStateStore<{ readonly count: number }>({
        pluginDataDir: dataDir,
        hookId: "state-hook",
        sessionId: "session/one",
        version: 2
      });

      assert.equal(store.save({ count: 3 }), true);
      assert.deepEqual(store.load(), { count: 3 });

      const statePath = join(dataDir, "state-hook", `${encodeSessionStateKey("session/one")}.json`);
      assert.equal(existsSync(statePath), true);
      assert.deepEqual(JSON.parse(readFileSync(statePath, "utf8")) as unknown, { version: 2, payload: { count: 3 } });
    });
  });

  it("deleteHookSessionState removes both file state and nested directory state", async () => {
    await withHookFixture(({ dataDir }) => {
      const sessionKey = encodeSessionStateKey("session-two");
      const hookDir = join(dataDir, "cleanup-hook");
      const nestedDir = join(hookDir, sessionKey);
      mkdirSync(nestedDir, { recursive: true });
      const store = createJsonStateStore<{ readonly ok: boolean }>({
        pluginDataDir: dataDir,
        hookId: "cleanup-hook",
        sessionId: "session-two",
        version: 1
      });
      assert.equal(store.save({ ok: true }), true);

      deleteHookSessionState({ pluginDataDir: dataDir, hookId: "cleanup-hook", sessionId: "session-two" });

      assert.equal(existsSync(nestedDir), false);
      assert.equal(existsSync(join(hookDir, `${sessionKey}.json`)), false);
    });
  });

  it("uses path-safe session keys for special and unicode session ids", async () => {
    await withHookFixture(({ dataDir }) => {
      for (const sessionId of [".", "..", "../x", "session/with/slash", "unicode-☃"] as const) {
        const key = encodeSessionStateKey(sessionId);
        assert.match(key, /^s-[A-Za-z0-9_-]+$/);
        assert.notEqual(key, ".");
        assert.notEqual(key, "..");
        assert.equal(key.includes("/"), false);

        const store = createJsonStateStore<{ readonly sessionId: string }>({
          pluginDataDir: dataDir,
          hookId: "safe-key-hook",
          sessionId,
          version: 1
        });

        assert.equal(store.save({ sessionId }), true);
        assert.deepEqual(store.load(), { sessionId });
        assert.equal(existsSync(join(dataDir, "safe-key-hook", `${key}.json`)), true);
      }
    });
  });

  it("deleteHookSessionState never treats special session ids as path segments", async () => {
    await withHookFixture(({ dataDir }) => {
      const hookDir = join(dataDir, "safe-delete-hook");
      mkdirSync(hookDir, { recursive: true });
      writeFileSync(join(hookDir, "keep.txt"), "keep", "utf8");
      writeFileSync(join(dataDir, "keep-sibling.txt"), "keep", "utf8");

      for (const sessionId of [".", ".."] as const) {
        const store = createJsonStateStore<{ readonly ok: boolean }>({
          pluginDataDir: dataDir,
          hookId: "safe-delete-hook",
          sessionId,
          version: 1
        });
        assert.equal(store.save({ ok: true }), true);

        deleteHookSessionState({ pluginDataDir: dataDir, hookId: "safe-delete-hook", sessionId });

        assert.equal(existsSync(hookDir), true);
        assert.equal(existsSync(join(hookDir, "keep.txt")), true);
        assert.equal(existsSync(join(dataDir, "keep-sibling.txt")), true);
        assert.equal(existsSync(join(hookDir, `${encodeSessionStateKey(sessionId)}.json`)), false);
      }
    });
  });

  it("missing pluginDataDir returns undefined and write operations return false", () => {
    const store = createJsonStateStore<{ readonly value: string }>({
      pluginDataDir: undefined,
      hookId: "missing-dir-hook",
      sessionId: "session",
      version: 1
    });

    assert.equal(store.load(), undefined);
    assert.equal(store.save({ value: "no-op" }), false);
    assert.equal(store.mutate(() => ({ value: "no-op" })), false);
  });

  it("round-trips arbitrary serializable shapes per hook", async () => {
    await withHookFixture(({ dataDir }) => {
      const first = createJsonStateStore<{ readonly items: readonly string[]; readonly nested: { readonly enabled: boolean } }>({
        pluginDataDir: dataDir,
        hookId: "shape-hook",
        sessionId: "session",
        version: 1
      });
      const second = createJsonStateStore<{ readonly label: string }>({
        pluginDataDir: dataDir,
        hookId: "other-hook",
        sessionId: "session",
        version: 1
      });

      assert.equal(first.save({ items: ["a", "b"], nested: { enabled: true } }), true);
      assert.equal(second.save({ label: "separate" }), true);

      assert.deepEqual(first.load(), { items: ["a", "b"], nested: { enabled: true } });
      assert.deepEqual(second.load(), { label: "separate" });
    });
  });

  it("concurrent child-process updates do not corrupt JSON or lose increments", async () => {
    await withHookFixture(async ({ dataDir }) => {
      const workerScript = `
        import { createJsonStateStore } from ${JSON.stringify(join(process.cwd(), "dist/src/hooks/shared/state-store.js"))};
        const store = createJsonStateStore({ pluginDataDir: ${JSON.stringify(dataDir)}, hookId: "concurrent-hook", sessionId: "session", version: 1 });
        const ok = store.mutate((current) => ({ count: (current?.count ?? 0) + 1 }));
        if (!ok) process.exit(1);
      `;

      const results = await Promise.all([runNodeScript(workerScript), runNodeScript(workerScript), runNodeScript(workerScript)]);

      assert.deepEqual(results.map((result) => result.exitCode), [0, 0, 0]);
      const statePath = join(dataDir, "concurrent-hook", `${encodeSessionStateKey("session")}.json`);
      assert.deepEqual(JSON.parse(readFileSync(statePath, "utf8")) as unknown, { version: 1, payload: { count: 3 } });
    });
  });

  it("lock acquisition timeout returns false without throwing for non-security state", async () => {
    await withHookFixture(({ dataDir }) => {
      const lockDir = join(dataDir, "locked-hook", ".locks", encodeSessionStateKey("session"));
      mkdirSync(lockDir, { recursive: true });
      const store = createJsonStateStore<{ readonly count: number }>({
        pluginDataDir: dataDir,
        hookId: "locked-hook",
        sessionId: "session",
        version: 1
      });

      assert.equal(store.mutate(() => ({ count: 1 })), false);
      assert.equal(store.save({ count: 1 }), false);
      rmSync(lockDir, { recursive: true, force: true });
    });
  });

  it("recovers stale lock directories before writing state", async () => {
    await withHookFixture(({ dataDir }) => {
      const lockDir = join(dataDir, "stale-lock-hook", ".locks", encodeSessionStateKey("session"));
      mkdirSync(lockDir, { recursive: true });
      writeFileSync(
        join(lockDir, "owner.json"),
        JSON.stringify({ pid: -1, createdAt: Date.now() - 60_000, token: "stale" }),
        "utf8"
      );
      const store = createJsonStateStore<{ readonly recovered: boolean }>({
        pluginDataDir: dataDir,
        hookId: "stale-lock-hook",
        sessionId: "session",
        version: 1
      });

      assert.equal(store.save({ recovered: true }), true);
      assert.deepEqual(store.load(), { recovered: true });
    });
  });

  it("recovers from corrupt JSON state on next successful write", async () => {
    await withHookFixture(({ dataDir }) => {
      const statePath = join(dataDir, "corrupt-hook", `${encodeSessionStateKey("session")}.json`);
      mkdirSync(join(dataDir, "corrupt-hook"), { recursive: true });
      writeFileSync(statePath, "{", "utf8");
      const store = createJsonStateStore<{ readonly ok: boolean }>({
        pluginDataDir: dataDir,
        hookId: "corrupt-hook",
        sessionId: "session",
        version: 1
      });

      assert.equal(store.load(), undefined);
      assert.equal(store.save({ ok: true }), true);
      assert.deepEqual(store.load(), { ok: true });
    });
  });
});
