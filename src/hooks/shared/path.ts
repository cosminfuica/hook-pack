import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

const TOOL_PATH_KEYS = ["file_path", "filePath", "path"] as const;

export function extractToolPath(toolInput: Record<string, unknown> | undefined): string | undefined {
  if (toolInput === undefined) {
    return undefined;
  }

  for (const key of TOOL_PATH_KEYS) {
    if (Object.hasOwn(toolInput, key)) {
      const value = toolInput[key];
      if (typeof value !== "string") {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed === "" ? undefined : value;
    }
  }

  return undefined;
}

export function resolveToolPath(cwd: string, candidate: string): string {
  return resolve(cwd, candidate);
}

export function isPathInsideDirectory(parent: string, child: string): boolean {
  const relativePath = relative(resolve(parent), resolve(child));
  return relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}

export function canonicalizeExistingOrParent(target: string): string {
  if (existsSync(target)) {
    return realpathSync(target);
  }

  try {
    return join(realpathSync(dirname(target)), basename(target));
  } catch {
    return resolve(target);
  }
}
