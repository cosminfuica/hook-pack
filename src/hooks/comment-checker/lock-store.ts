import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface CommentCheckerLockStore {
  readonly withLock: <T>(name: string, run: () => Promise<T>) => Promise<T | null>;
}

export interface CommentCheckerLockStoreOptions {
  readonly pluginDataDir: string | undefined;
  readonly now: () => number;
  readonly staleLockMs?: number | undefined;
}

interface LockOwner {
  readonly pid: number;
  readonly createdAt: number;
  readonly token: string;
}

interface AcquiredLock {
  readonly dir: string;
  readonly token: string;
}

const DEFAULT_STALE_LOCK_MS = 30_000;
const LOCK_ATTEMPTS = 5;
const LOCK_RETRY_MS = 25;

export function createCommentCheckerLockStore(options: CommentCheckerLockStoreOptions): CommentCheckerLockStore {
  return {
    withLock: async (name, run) => {
      const lock = acquireLock(options, name);
      if (lock === null) {
        return null;
      }

      try {
        return await run();
      } catch {
        return null;
      } finally {
        releaseLock(lock);
      }
    }
  };
}

export function cleanupStaleCommentCheckerLocks(options: CommentCheckerLockStoreOptions): void {
  if (options.pluginDataDir === undefined) {
    return;
  }

  const locksDir = join(options.pluginDataDir, "comment-checker", "locks");
  if (!existsSync(locksDir)) {
    return;
  }

  try {
    for (const entry of readdirSync(locksDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.endsWith(".lock")) {
        continue;
      }
      const lockDir = join(locksDir, entry.name);
      if (isStaleLock(lockDir, options.now(), options.staleLockMs ?? DEFAULT_STALE_LOCK_MS)) {
        removePath(lockDir);
      }
    }
  } catch {
    // Best-effort lifecycle cleanup; lock acquisition also recovers stale locks.
  }
}

function acquireLock(options: CommentCheckerLockStoreOptions, name: string): AcquiredLock | null {
  if (options.pluginDataDir === undefined) {
    return null;
  }

  const lockDir = join(options.pluginDataDir, "comment-checker", "locks", `${sanitizeLockName(name)}.lock`);
  try {
    mkdirSync(join(options.pluginDataDir, "comment-checker", "locks"), { recursive: true });
  } catch {
    return null;
  }

  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt++) {
    try {
      const token = randomUUID();
      mkdirSync(lockDir);
      writeFileSync(join(lockDir, "owner.json"), `${JSON.stringify({ pid: process.pid, createdAt: options.now(), token })}\n`, "utf8");
      return { dir: lockDir, token };
    } catch (error) {
      if (!isErrorWithCode(error) || error.code !== "EEXIST") {
        return null;
      }
      if (isStaleLock(lockDir, options.now(), options.staleLockMs ?? DEFAULT_STALE_LOCK_MS)) {
        removePath(lockDir);
        continue;
      }
      sleep(LOCK_RETRY_MS);
    }
  }

  return null;
}

function releaseLock(lock: AcquiredLock): void {
  try {
    const owner = readOwner(lock.dir);
    if (owner?.token === lock.token) {
      rmSync(lock.dir, { recursive: true, force: true });
    }
  } catch {
    // Best-effort cleanup; future stale-lock recovery can remove it.
  }
}

function isStaleLock(lockDir: string, now: number, staleLockMs: number): boolean {
  const owner = readOwner(lockDir);
  return owner !== undefined && now - owner.createdAt > staleLockMs;
}

function readOwner(lockDir: string): LockOwner | undefined {
  try {
    const parsed: unknown = JSON.parse(readFileSync(join(lockDir, "owner.json"), "utf8"));
    if (!isRecord(parsed) || typeof parsed.pid !== "number" || typeof parsed.createdAt !== "number" || typeof parsed.token !== "string") {
      return undefined;
    }
    return { pid: parsed.pid, createdAt: parsed.createdAt, token: parsed.token };
  } catch {
    return undefined;
  }
}

function sanitizeLockName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-") || "lock";
}

function removePath(path: string): void {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
    // Best-effort stale lock cleanup only.
  }
}

function sleep(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrorWithCode(value: unknown): value is { readonly code: string } {
  return typeof value === "object" && value !== null && "code" in value && typeof value.code === "string";
}
