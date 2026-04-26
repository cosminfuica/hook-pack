import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import type { Dirent } from "node:fs";
import { dirname, join } from "node:path";

export interface ReadPermissionTokenStore {
  readonly grantReadToken: (sessionId: string, canonicalPath: string, fingerprint: FileFingerprint) => boolean;
  readonly consumeTokenAndInvalidateOtherSessions: (sessionId: string, canonicalPath: string, currentFingerprint: FileFingerprint) => "consumed" | "missing" | "stale" | "locked";
  readonly invalidateForOverwrite: (canonicalPath: string, exceptSessionId: string | undefined) => "invalidated" | "locked";
  readonly deleteSession: (sessionId: string | undefined) => void;
}

export interface FileFingerprint {
  readonly realpath: string;
  readonly mtimeMs: number;
  readonly size: number;
  readonly dev?: number | undefined;
  readonly ino?: number | undefined;
}

interface StoredReadToken {
  readonly createdAt: number;
  readonly touchedAt: number;
  readonly fingerprint: StoredFileFingerprint;
}

interface StoredFileFingerprint {
  readonly realpathHash: string;
  readonly mtimeMs: number;
  readonly size: number;
  readonly dev?: number | undefined;
  readonly ino?: number | undefined;
}

interface PathLock {
  readonly lockDir: string;
  readonly ownerToken: string;
}

interface TokenStoreOptions {
  readonly pluginDataDir: string | undefined;
  readonly hookId: string;
  readonly now: () => number;
  readonly maxTrackedSessions?: number;
  readonly maxTrackedPathsPerSession?: number;
  readonly staleLockMs?: number;
}

const DEFAULT_MAX_TRACKED_SESSIONS = 256;
const DEFAULT_MAX_TRACKED_PATHS_PER_SESSION = 1024;
const DEFAULT_STALE_LOCK_MS = 30_000;
const TOUCH_FILE = ".touch";

export function createReadPermissionTokenStore(options: TokenStoreOptions): ReadPermissionTokenStore {
  const rootDir = options.pluginDataDir === undefined ? undefined : join(options.pluginDataDir, options.hookId);
  const maxTrackedSessions = options.maxTrackedSessions ?? DEFAULT_MAX_TRACKED_SESSIONS;
  const maxTrackedPathsPerSession = options.maxTrackedPathsPerSession ?? DEFAULT_MAX_TRACKED_PATHS_PER_SESSION;
  const staleLockMs = options.staleLockMs ?? DEFAULT_STALE_LOCK_MS;

  return {
    grantReadToken(sessionId, canonicalPath, fingerprint) {
      if (rootDir === undefined) {
        return false;
      }

      try {
        const now = options.now();
        const pathDir = pathTokenDir(rootDir, sessionId, canonicalPath);
        mkdirSync(pathDir, { recursive: true });
        writeJson(join(pathDir, `${now}-${randomUUID()}.json`), {
          createdAt: now,
          touchedAt: now,
          fingerprint: toStoredFingerprint(fingerprint)
        });
        touchPath(pathDir, now);
        touchSession(rootDir, sessionId, now);
        trimSessionPathDirs(rootDir, sessionId, maxTrackedPathsPerSession);
        trimSessions(rootDir, maxTrackedSessions);
        return true;
      } catch {
        // Fail closed: if a read token cannot be persisted, the later write is denied.
        return false;
      }
    },

    consumeTokenAndInvalidateOtherSessions(sessionId, canonicalPath, currentFingerprint) {
      if (rootDir === undefined) {
        return "missing";
      }

      const lock = acquirePathLock(rootDir, canonicalPath, options.now, staleLockMs);
      if (lock === undefined) {
        return "locked";
      }

      try {
        const tokenFile = oldestTokenFile(pathTokenDir(rootDir, sessionId, canonicalPath));
        if (tokenFile === undefined) {
          return "missing";
        }

        const token = readStoredReadToken(tokenFile);
        if (token === undefined || !fingerprintsMatch(token.fingerprint, currentFingerprint)) {
          unlinkIfExists(tokenFile);
          return "stale";
        }

        unlinkSync(tokenFile);
        touchSession(rootDir, sessionId, options.now());
        trimSessions(rootDir, maxTrackedSessions);
        removeOtherSessionPathDirs(rootDir, canonicalPath, sessionId);
        return "consumed";
      } catch {
        // Fail closed: ambiguous token-store errors deny unsafe writes as locked.
        return "locked";
      } finally {
        releasePathLock(lock);
      }
    },

    invalidateForOverwrite(canonicalPath, exceptSessionId) {
      if (rootDir === undefined) {
        return "invalidated";
      }

      const lock = acquirePathLock(rootDir, canonicalPath, options.now, staleLockMs);
      if (lock === undefined) {
        return "locked";
      }

      try {
        removeOtherSessionPathDirs(rootDir, canonicalPath, exceptSessionId);
        return "invalidated";
      } catch {
        // Fail closed: if overwrite invalidation cannot finish, the overwrite is denied.
        return "locked";
      } finally {
        releasePathLock(lock);
      }
    },

    deleteSession(sessionId) {
      if (rootDir === undefined || sessionId === undefined || sessionId.trim() === "") {
        return;
      }
      rmSync(sessionDir(rootDir, sessionId), { recursive: true, force: true });
    }
  };
}

function acquirePathLock(rootDir: string, canonicalPath: string, now: () => number, staleLockMs: number): PathLock | undefined {
  const lockDir = join(rootDir, ".locks", pathHash(canonicalPath));
  mkdirSync(dirname(lockDir), { recursive: true });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const ownerToken = randomUUID();
      mkdirSync(lockDir, { recursive: false });
      try {
        writeJson(join(lockDir, "owner.json"), { pid: process.pid, createdAt: now(), token: ownerToken });
      } catch (error) {
        rmSync(lockDir, { recursive: true, force: true });
        throw error;
      }
      return { lockDir, ownerToken };
    } catch (error) {
      if (!isFileSystemError(error, "EEXIST")) {
        return undefined;
      }
      if (attempt === 0 && isStaleLock(lockDir, now(), staleLockMs)) {
        reapStaleLock(lockDir, rootDir, canonicalPath);
        continue;
      }
      return undefined;
    }
  }

  return undefined;
}

function reapStaleLock(lockDir: string, rootDir: string, canonicalPath: string): void {
  const reaperDir = join(rootDir, ".locks", `.reap-${pathHash(canonicalPath)}`);
  try {
    mkdirSync(reaperDir, { recursive: false });
  } catch {
    // Best effort: another process is already reaping or lock acquisition should fail safely.
    return;
  }

  try {
    rmSync(lockDir, { recursive: true, force: true });
  } finally {
    rmSync(reaperDir, { recursive: true, force: true });
  }
}

function releasePathLock(lock: PathLock): void {
  const owner = readJson(join(lock.lockDir, "owner.json"));
  if (!isRecord(owner) || owner.token !== lock.ownerToken) {
    return;
  }

  rmSync(lock.lockDir, { recursive: true, force: true });
}

function isStaleLock(lockDir: string, now: number, staleLockMs: number): boolean {
  const owner = readJson(join(lockDir, "owner.json"));
  if (isRecord(owner) && typeof owner.createdAt === "number") {
    return now - owner.createdAt > staleLockMs;
  }

  return now - directoryMtime(lockDir, now) > staleLockMs;
}

function directoryMtime(directory: string, fallback: number): number {
  try {
    return statSync(directory).mtimeMs;
  } catch {
    // Fail safe: if freshness cannot be proven, do not reap another process's lock.
    return fallback;
  }
}

function trimSessions(rootDir: string, maxTrackedSessions: number): void {
  const sessions = sessionDirectoryNames(rootDir).map((name) => ({ name, touchedAt: touchMtime(join(rootDir, name, TOUCH_FILE)) }));
  sessions.sort(compareTouchedEntries);
  for (const session of sessions.slice(0, Math.max(0, sessions.length - maxTrackedSessions))) {
    rmSync(join(rootDir, session.name), { recursive: true, force: true });
  }
}

function trimSessionPathDirs(rootDir: string, sessionId: string, maxTrackedPathsPerSession: number): void {
  const dir = sessionDir(rootDir, sessionId);
  const paths = readdirDirents(dir)
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, touchedAt: touchMtime(join(dir, entry.name, TOUCH_FILE)) }));
  paths.sort(compareTouchedEntries);
  for (const path of paths.slice(0, Math.max(0, paths.length - maxTrackedPathsPerSession))) {
    rmSync(join(dir, path.name), { recursive: true, force: true });
  }
}

function removeOtherSessionPathDirs(rootDir: string, canonicalPath: string, exceptSessionId: string | undefined): void {
  const hash = pathHash(canonicalPath);
  const exceptSessionDirName = exceptSessionId === undefined ? undefined : sessionDirName(exceptSessionId);
  for (const sessionName of sessionDirectoryNames(rootDir)) {
    if (exceptSessionDirName !== undefined && sessionName === exceptSessionDirName) {
      continue;
    }
    rmSync(join(rootDir, sessionName, hash), { recursive: true, force: true });
  }
}

function oldestTokenFile(pathDir: string): string | undefined {
  const files = readdirDirents(pathDir)
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
      const filePath = join(pathDir, entry.name);
      return { filePath, createdAt: readStoredReadToken(filePath)?.createdAt ?? touchMtime(filePath) };
    });
  files.sort((left, right) => left.createdAt - right.createdAt || left.filePath.localeCompare(right.filePath));
  return files[0]?.filePath;
}

function readStoredReadToken(filePath: string): StoredReadToken | undefined {
  const parsed = readJson(filePath);
  if (!isRecord(parsed) || typeof parsed.createdAt !== "number" || typeof parsed.touchedAt !== "number" || !isStoredFileFingerprint(parsed.fingerprint)) {
    return undefined;
  }
  return { createdAt: parsed.createdAt, touchedAt: parsed.touchedAt, fingerprint: parsed.fingerprint };
}

function isStoredFileFingerprint(value: unknown): value is StoredFileFingerprint {
  return isRecord(value) &&
    typeof value.realpathHash === "string" &&
    typeof value.mtimeMs === "number" &&
    typeof value.size === "number" &&
    optionalNumber(value.dev) &&
    optionalNumber(value.ino);
}

function fingerprintsMatch(left: StoredFileFingerprint, right: FileFingerprint): boolean {
  return left.realpathHash === pathHash(right.realpath) &&
    left.mtimeMs === right.mtimeMs &&
    left.size === right.size &&
    optionalStatFieldMatches(left.dev, right.dev) &&
    optionalStatFieldMatches(left.ino, right.ino);
}

function optionalNumber(value: unknown): boolean {
  return value === undefined || typeof value === "number";
}

function optionalStatFieldMatches(left: number | undefined, right: number | undefined): boolean {
  return left === undefined || right === undefined || left === right;
}

function toStoredFingerprint(fingerprint: FileFingerprint): StoredFileFingerprint {
  return {
    realpathHash: pathHash(fingerprint.realpath),
    mtimeMs: fingerprint.mtimeMs,
    size: fingerprint.size,
    dev: fingerprint.dev,
    ino: fingerprint.ino
  };
}

function touchSession(rootDir: string, sessionId: string, now: number): void {
  const dir = sessionDir(rootDir, sessionId);
  mkdirSync(dir, { recursive: true });
  touchFile(join(dir, TOUCH_FILE), now);
}

function touchPath(pathDir: string, now: number): void {
  touchFile(join(pathDir, TOUCH_FILE), now);
}

function touchFile(filePath: string, millis: number): void {
  writeFileSync(filePath, String(millis), "utf8");
  const date = new Date(millis);
  utimesSync(filePath, date, date);
}

function touchMtime(filePath: string): number {
  try {
    const storedTouchTime = Number(readFileSync(filePath, "utf8"));
    if (Number.isFinite(storedTouchTime)) {
      return storedTouchTime;
    }

    return statSync(filePath).mtimeMs;
  } catch {
    // Missing/corrupt touch files are treated as oldest for LRU trimming.
    return 0;
  }
}

function compareTouchedEntries(left: { readonly name: string; readonly touchedAt: number }, right: { readonly name: string; readonly touchedAt: number }): number {
  return left.touchedAt - right.touchedAt || left.name.localeCompare(right.name);
}

function sessionDirectoryNames(rootDir: string): string[] {
  return readdirDirents(rootDir)
    .filter((entry) => entry.isDirectory() && entry.name !== ".locks" && !entry.name.startsWith(".reap-"))
    .map((entry) => entry.name);
}

function pathTokenDir(rootDir: string, sessionId: string, canonicalPath: string): string {
  return join(sessionDir(rootDir, sessionId), pathHash(canonicalPath));
}

function sessionDir(rootDir: string, sessionId: string): string {
  return join(rootDir, sessionDirName(sessionId));
}

function sessionDirName(sessionId: string): string {
  return pathHash(sessionId);
}

function pathHash(canonicalPath: string): string {
  return createHash("sha256").update(canonicalPath).digest("hex");
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value), "utf8");
}

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  } catch {
    // Invalid or missing metadata is ignored; callers fail closed or treat state as stale.
    return undefined;
  }
}

function unlinkIfExists(filePath: string): void {
  try {
    unlinkSync(filePath);
  } catch (error) {
    if (!isFileSystemError(error, "ENOENT")) {
      throw error;
    }
  }
}

function readdirDirents(path: string): Dirent[] {
  try {
    return readdirSync(path, { withFileTypes: true });
  } catch (error) {
    if (isFileSystemError(error, "ENOENT")) {
      return [];
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFileSystemError(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === code;
}
