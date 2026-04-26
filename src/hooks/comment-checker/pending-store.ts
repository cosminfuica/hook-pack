import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const COMMENT_CHECKER_PENDING_TTL_MS = 60_000;

export type PendingCommentToolName = "write" | "edit" | "multiedit";

export interface PendingCommentEdit {
  readonly old_string: string;
  readonly new_string: string;
}

export interface PendingCommentCheck {
  readonly key: string;
  readonly toolName: PendingCommentToolName;
  readonly sessionId: string;
  readonly filePath: string;
  readonly createdAt: number;
}

export interface PendingCommentStore {
  readonly put: (sessionId: string, pending: PendingCommentCheck) => boolean;
  readonly take: (sessionId: string, key: string, now: number) => PendingCommentCheck | undefined;
  readonly cleanupStale: (sessionId: string, now: number) => void;
  readonly deleteSession: (sessionId: string | undefined) => void;
}

interface PendingCommentStoreOptions {
  readonly pluginDataDir: string | undefined;
}

export function createPendingCommentStore(options: PendingCommentStoreOptions): PendingCommentStore {
  return {
    put: (sessionId, pending) => {
      const path = pendingPath(options.pluginDataDir, sessionId, pending.key);
      if (path === undefined) {
        return false;
      }

      try {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, `${JSON.stringify(sanitizePendingCommentCheck(pending))}\n`, "utf8");
        return true;
      } catch {
        return false;
      }
    },
    take: (sessionId, key, now) => {
      const path = pendingPath(options.pluginDataDir, sessionId, key);
      if (path === undefined || !existsSync(path)) {
        return undefined;
      }

      try {
        const pending = normalizePendingCommentCheck(JSON.parse(readFileSync(path, "utf8")));
        unlinkSync(path);
        if (pending === undefined || isExpired(pending, now)) {
          return undefined;
        }
        return pending;
      } catch {
        removePath(path);
        return undefined;
      }
    },
    cleanupStale: (sessionId, now) => {
      const dir = sessionDir(options.pluginDataDir, sessionId);
      if (dir === undefined || !existsSync(dir)) {
        return;
      }

      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(".json")) {
          continue;
        }
        const path = join(dir, entry.name);
        try {
          const pending = normalizePendingCommentCheck(JSON.parse(readFileSync(path, "utf8")));
          if (pending === undefined || isExpired(pending, now)) {
            unlinkSync(path);
          }
        } catch {
          removePath(path);
        }
      }
      removeEmptyDir(dir);
    },
    deleteSession: (sessionId) => {
      const dir = sessionDir(options.pluginDataDir, sessionId);
      if (dir !== undefined) {
        removePath(dir);
      }
    }
  };
}

function pendingPath(pluginDataDir: string | undefined, sessionId: string, key: string): string | undefined {
  const dir = sessionDir(pluginDataDir, sessionId);
  return dir === undefined ? undefined : join(dir, `${sha256(key)}.json`);
}

function sessionDir(pluginDataDir: string | undefined, sessionId: string | undefined): string | undefined {
  if (pluginDataDir === undefined || sessionId === undefined || sessionId.trim() === "") {
    return undefined;
  }
  return join(pluginDataDir, "comment-checker", "pending", encodeSessionId(sessionId));
}

function encodeSessionId(sessionId: string): string {
  return `s-${Buffer.from(sessionId, "utf8").toString("base64url")}`;
}

function isExpired(pending: PendingCommentCheck, now: number): boolean {
  return now - pending.createdAt > COMMENT_CHECKER_PENDING_TTL_MS;
}

function normalizePendingCommentCheck(value: unknown): PendingCommentCheck | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.key !== "string" ||
    !isPendingToolName(value.toolName) ||
    typeof value.sessionId !== "string" ||
    typeof value.filePath !== "string" ||
    typeof value.createdAt !== "number"
  ) {
    return undefined;
  }

  return sanitizePendingCommentCheck({
    key: value.key,
    toolName: value.toolName,
    sessionId: value.sessionId,
    filePath: value.filePath,
    createdAt: value.createdAt
  });
}

function sanitizePendingCommentCheck(pending: PendingCommentCheck): PendingCommentCheck {
  return {
    key: pending.key,
    toolName: pending.toolName,
    sessionId: pending.sessionId,
    filePath: pending.filePath,
    createdAt: pending.createdAt
  };
}

function isPendingToolName(value: unknown): value is PendingCommentToolName {
  return value === "write" || value === "edit" || value === "multiedit";
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function removePath(path: string): void {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup; stale files are harmless and will be retried later.
  }
}

function removeEmptyDir(path: string): void {
  try {
    if (existsSync(path) && readdirSync(path).length === 0) {
      rmSync(path, { recursive: false, force: true });
    }
  } catch {
    // Best-effort cleanup only.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
