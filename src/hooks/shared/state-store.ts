import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";

export interface JsonStateStoreOptions {
  readonly pluginDataDir: string | undefined;
  readonly hookId: string;
  readonly sessionId: string | undefined;
  readonly version: number;
}

export interface JsonStateStore<T> {
  readonly load: () => T | undefined;
  readonly save: (state: T) => boolean;
  readonly mutate: (mutator: (current: T | undefined) => T) => boolean;
}

interface StatePaths {
  readonly statePath: string;
  readonly lockPath: string;
}

interface StateEnvelope {
  readonly version: unknown;
  readonly payload: unknown;
}

const LOCK_ATTEMPTS = 5;
const LOCK_RETRY_MS = 50;
const STALE_LOCK_MS = 30_000;

export function createJsonStateStore<T>(options: JsonStateStoreOptions): JsonStateStore<T> {
  return {
    load: () => {
      const paths = resolveStatePaths(options);
      return paths === undefined ? undefined : readJsonState<T>(paths.statePath, options.version);
    },
    save: (state: T) => withStateLock(options, (paths) => writeJsonState(paths.statePath, options.version, state)),
    mutate: (mutator: (current: T | undefined) => T) => withStateLock(options, (paths) => {
      const current = readJsonState<T>(paths.statePath, options.version);
      return writeJsonState(paths.statePath, options.version, mutator(current));
    })
  };
}

export function readJsonState<T>(statePath: string, version: number): T | undefined {
  if (!existsSync(statePath)) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(readFileSync(statePath, "utf8"));
    if (!isStateEnvelope(parsed) || parsed.version !== version) {
      return undefined;
    }

    return parsed.payload as T;
  } catch {
    // Corrupt state is treated as absent so later successful writes can repair it.
    return undefined;
  }
}

function withStateLock(options: JsonStateStoreOptions, run: (paths: StatePaths) => boolean): boolean {
  const paths = resolveStatePaths(options);
  if (paths === undefined) {
    return false;
  }

  const lock = acquireLock(paths.lockPath);
  if (lock === undefined) {
    return false;
  }

  try {
    return run(paths);
  } catch {
    return false;
  } finally {
    releaseLock(lock);
  }
}

function resolveStatePaths(options: JsonStateStoreOptions): StatePaths | undefined {
  if (options.pluginDataDir === undefined || options.sessionId === undefined || options.sessionId.trim() === "") {
    return undefined;
  }

  const hookDir = join(options.pluginDataDir, options.hookId);
  const sessionKey = encodeSessionStateKey(options.sessionId);
  return {
    statePath: join(hookDir, `${sessionKey}.json`),
    lockPath: join(hookDir, ".locks", sessionKey)
  };
}

export function encodeSessionStateKey(sessionId: string): string {
  return `s-${Buffer.from(sessionId, "utf8").toString("base64url")}`;
}

interface StateLock {
  readonly path: string;
  readonly token: string;
}

function acquireLock(lockPath: string): StateLock | undefined {
  try {
    mkdirSync(dirname(lockPath), { recursive: true });
  } catch {
    return undefined;
  }

  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt++) {
    try {
      const token = randomUUID();
      mkdirSync(lockPath);
      try {
        writeFileSync(join(lockPath, "owner.json"), `${JSON.stringify({ pid: process.pid, createdAt: Date.now(), token })}\n`, "utf8");
      } catch (error) {
        rmSync(lockPath, { recursive: true, force: true });
        throw error;
      }
      return { path: lockPath, token };
    } catch (error) {
      if (!isErrorWithCode(error) || error.code !== "EEXIST") {
        return undefined;
      }
      if (isStaleLock(lockPath)) {
        reapStaleLock(lockPath);
        continue;
      }
      sleep(LOCK_RETRY_MS);
    }
  }

  return undefined;
}

function releaseLock(lock: StateLock): void {
  try {
    const owner = readLockOwner(lock.path);
    if (owner?.token === lock.token) {
      rmSync(lock.path, { recursive: true, force: true });
    }
  } catch {
    // Best-effort cleanup: a later stale-lock pass can recover this directory.
  }
}

function isStaleLock(lockPath: string): boolean {
  const owner = readLockOwner(lockPath);
  return owner !== undefined && Date.now() - owner.createdAt > STALE_LOCK_MS;
}

function reapStaleLock(lockPath: string): void {
  try {
    rmSync(lockPath, { recursive: true, force: true });
  } catch {
    // Best-effort stale-lock recovery: caller will retry/fail without throwing.
  }
}

function readLockOwner(lockPath: string): { readonly createdAt: number; readonly token: string } | undefined {
  try {
    const parsed: unknown = JSON.parse(readFileSync(join(lockPath, "owner.json"), "utf8"));
    if (!isRecord(parsed) || typeof parsed.createdAt !== "number" || typeof parsed.token !== "string") {
      return undefined;
    }
    return { createdAt: parsed.createdAt, token: parsed.token };
  } catch {
    return undefined;
  }
}

function writeJsonState<T>(statePath: string, version: number, payload: T): boolean {
  try {
    mkdirSync(dirname(statePath), { recursive: true });
    const tempPath = `${statePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify({ version, payload })}\n`, "utf8");
    renameSync(tempPath, statePath);
    return true;
  } catch {
    return false;
  }
}

function sleep(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function isStateEnvelope(value: unknown): value is StateEnvelope {
  return typeof value === "object" && value !== null && Object.hasOwn(value, "version") && Object.hasOwn(value, "payload");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrorWithCode(value: unknown): value is { readonly code: string } {
  return typeof value === "object" && value !== null && "code" in value && typeof value.code === "string";
}
