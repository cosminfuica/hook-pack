import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import { withFileLock } from "../shared/file-lock.js";

export interface ParsedRuleCacheEntry {
  readonly mtimeMs: number;
  readonly size: number;
  readonly metadata: Record<string, unknown>;
  readonly body: string;
}

export interface ParsedRuleCache {
  readonly load: (realpath: string, mtimeMs: number, size: number) => ParsedRuleCacheEntry | undefined;
  readonly store: (realpath: string, entry: ParsedRuleCacheEntry) => boolean;
}

export function createParsedRuleCache(options: { readonly pluginDataDir: string | undefined }): ParsedRuleCache {
  return {
    load: (realpath, mtimeMs, size) => {
      if (options.pluginDataDir === undefined) {
        return undefined;
      }

      try {
        const parsed: unknown = JSON.parse(readFileSync(cachePath(options.pluginDataDir, realpath), "utf8"));
        if (!isParsedRuleCacheEntry(parsed) || parsed.mtimeMs !== mtimeMs || parsed.size !== size) {
          return undefined;
        }
        return parsed;
      } catch {
        return undefined;
      }
    },
    store: (realpath, entry) => {
      if (options.pluginDataDir === undefined) {
        return false;
      }

      const targetPath = cachePath(options.pluginDataDir, realpath);
      const lockPath = join(dirname(targetPath), ".locks", basename(targetPath));
      return withFileLock(lockPath, () => {
        mkdirSync(dirname(targetPath), { recursive: true });
        const tempPath = join(dirname(targetPath), `${basename(targetPath)}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`);
        writeFileSync(tempPath, `${JSON.stringify(entry)}\n`, "utf8");
        renameSync(tempPath, targetPath);
        return true;
      });
    }
  };
}

function cachePath(pluginDataDir: string, realpath: string): string {
  return join(pluginDataDir, "rules-injector", "parsed-cache", `${createHash("sha256").update(realpath).digest("hex")}.json`);
}

function isParsedRuleCacheEntry(value: unknown): value is ParsedRuleCacheEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ParsedRuleCacheEntry).mtimeMs === "number" &&
    typeof (value as ParsedRuleCacheEntry).size === "number" &&
    typeof (value as ParsedRuleCacheEntry).body === "string" &&
    typeof (value as ParsedRuleCacheEntry).metadata === "object" &&
    (value as ParsedRuleCacheEntry).metadata !== null
  );
}
