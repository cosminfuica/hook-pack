import { constants, existsSync } from "node:fs";
import { access, lstat } from "node:fs/promises";
import { delimiter, join } from "node:path";

import type { RuntimeEnvironment } from "../../core/runtime-context.js";
import { createCommentCheckerLockStore } from "./lock-store.js";

export interface CommentCheckerBinary {
  readonly path: string;
  readonly source: "env" | "plugin-data" | "path";
}

export interface ResolveBinaryOptions {
  readonly env: RuntimeEnvironment;
  readonly pluginDataDir: string | undefined;
  readonly download: (signal: AbortSignal) => Promise<string | null>;
  readonly signal: AbortSignal;
  readonly now?: (() => number) | undefined;
}

export async function resolveCommentCheckerBinary(options: ResolveBinaryOptions): Promise<CommentCheckerBinary | null> {
  const envCommand = cleanOptionalPath(options.env.COMMENT_CHECKER_COMMAND);
  if (envCommand !== undefined && await isExecutable(envCommand)) {
    return { path: envCommand, source: "env" };
  }

  const cachedBinary = options.pluginDataDir === undefined ? undefined : getCachedCommentCheckerBinaryPath(options.pluginDataDir);
  if (cachedBinary !== undefined && await isSafeCachedExecutable(cachedBinary)) {
    return { path: cachedBinary, source: "plugin-data" };
  }

  const pathBinary = await findOnPath(options.env.PATH);
  if (pathBinary !== null) {
    return { path: pathBinary, source: "path" };
  }

  if (options.pluginDataDir === undefined || cachedBinary === undefined || options.signal.aborted) {
    return null;
  }

  const lockStore = createCommentCheckerLockStore({ pluginDataDir: options.pluginDataDir, now: options.now ?? Date.now });
  const downloaded = await lockStore.withLock("download", async () => {
    if (await isSafeCachedExecutable(cachedBinary)) {
      return cachedBinary;
    }
    return options.download(options.signal);
  });

  if (downloaded !== null && downloaded !== undefined && await isSafeCachedExecutable(downloaded)) {
    return { path: downloaded, source: "plugin-data" };
  }
  if (downloaded === null && await waitForCachedBinary(cachedBinary, options.signal)) {
    return { path: cachedBinary, source: "plugin-data" };
  }
  if (await isSafeCachedExecutable(cachedBinary)) {
    return { path: cachedBinary, source: "plugin-data" };
  }
  return null;
}

export function getCachedCommentCheckerBinaryPath(pluginDataDir: string, platform: NodeJS.Platform = process.platform): string {
  const binaryName = platform === "win32" ? "comment-checker.exe" : "comment-checker";
  return join(pluginDataDir, "comment-checker", "bin", binaryName);
}

async function findOnPath(pathValue: string | undefined): Promise<string | null> {
  if (pathValue === undefined || pathValue.trim() === "") {
    return null;
  }

  for (const dir of pathValue.split(delimiter)) {
    if (dir.trim() === "") {
      continue;
    }
    const candidate = join(dir, process.platform === "win32" ? "comment-checker.exe" : "comment-checker");
    if (existsSync(candidate) && await isExecutable(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function isSafeCachedExecutable(path: string): Promise<boolean> {
  try {
    const stats = await lstat(path);
    return stats.isFile() && !stats.isSymbolicLink() && stats.nlink <= 1 && await isExecutable(path);
  } catch {
    // Missing or inaccessible cached binaries fail open to PATH/download resolution.
    return false;
  }
}

async function waitForCachedBinary(path: string, signal: AbortSignal): Promise<boolean> {
  for (let attempt = 0; attempt < 10; attempt++) {
    if (signal.aborted) {
      return false;
    }
    if (await isSafeCachedExecutable(path)) {
      return true;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 25);
    });
  }
  return false;
}

function cleanOptionalPath(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
