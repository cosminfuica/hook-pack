import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";

const LOCK_ATTEMPTS = 5;
const LOCK_RETRY_MS = 50;
const STALE_LOCK_MS = 30_000;

export function withFileLock(lockDir: string, run: () => boolean): boolean {
  const lock = acquireLock(lockDir);
  if (lock === undefined) {
    return false;
  }

  try {
    return run();
  } catch {
    return false;
  } finally {
    releaseLock(lock);
  }
}

interface FileLock {
  readonly dir: string;
  readonly token: string;
}

function acquireLock(lockDir: string): FileLock | undefined {
  try {
    mkdirSync(dirname(lockDir), { recursive: true });
  } catch {
    return undefined;
  }

  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt++) {
    try {
      const token = randomUUID();
      mkdirSync(lockDir);
      try {
        writeFileSync(`${lockDir}/owner.json`, `${JSON.stringify({ pid: process.pid, createdAt: Date.now(), token })}\n`, "utf8");
      } catch (error) {
        rmSync(lockDir, { recursive: true, force: true });
        throw error;
      }
      return { dir: lockDir, token };
    } catch (error) {
      if (!isErrorWithCode(error) || error.code !== "EEXIST") {
        return undefined;
      }
      if (isStaleLock(lockDir)) {
        reapStaleLock(lockDir);
        continue;
      }
      sleep(LOCK_RETRY_MS);
    }
  }

  return undefined;
}

function releaseLock(lock: FileLock): void {
  try {
    if (existsSync(lock.dir) && readLockToken(lock.dir) === lock.token) {
      rmSync(lock.dir, { recursive: true, force: true });
    }
  } catch {
    // Best-effort cleanup: a later stale-lock pass can recover this directory.
  }
}

function isStaleLock(lockDir: string): boolean {
  const owner = readLockOwner(lockDir);
  return owner !== undefined && Date.now() - owner.createdAt > STALE_LOCK_MS;
}

function reapStaleLock(lockDir: string): void {
  try {
    rmSync(lockDir, { recursive: true, force: true });
  } catch {
    // Best-effort stale-lock recovery: caller will retry/fail without throwing.
  }
}

function readLockToken(lockDir: string): string | undefined {
  return readLockOwner(lockDir)?.token;
}

function readLockOwner(lockDir: string): { readonly createdAt: number; readonly token: string } | undefined {
  try {
    const parsed: unknown = JSON.parse(readFileSync(`${lockDir}/owner.json`, "utf8"));
    if (!isRecord(parsed) || typeof parsed.createdAt !== "number" || typeof parsed.token !== "string") {
      return undefined;
    }
    return { createdAt: parsed.createdAt, token: parsed.token };
  } catch {
    return undefined;
  }
}

function sleep(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function isErrorWithCode(value: unknown): value is { readonly code: string } {
  return typeof value === "object" && value !== null && "code" in value && typeof value.code === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
