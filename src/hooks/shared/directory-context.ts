import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

import { formatContextBlock } from "./context-block.js";
import type { DynamicTruncator } from "./dynamic-truncator.js";
import { canonicalizeExistingOrParent, isPathInsideDirectory } from "./path.js";

// Adapted from upstream finder.ts and injector.ts modules for both AGENTS.md
// and README.md injectors. Adaptations: shared module for both injectors;
// uses dynamic-truncator instead of upstream storage helpers.
export interface DirectoryContextRequest {
  readonly cwd: string;
  readonly filePath: string;
  readonly filename: string;
  readonly heading: string;
  readonly includeRoot: boolean;
  readonly truncator: DynamicTruncator;
  readonly alreadyInjectedDirectories: ReadonlySet<string>;
  readonly sessionId: string;
}

export interface DirectoryContextResult {
  readonly context: string;
  readonly injectedDirectories: readonly string[];
}

export async function collectDirectoryContext(request: DirectoryContextRequest): Promise<DirectoryContextResult> {
  const cwd = canonicalizeExistingOrParent(resolve(request.cwd));
  const filePath = canonicalizeExistingOrParent(resolve(cwd, request.filePath));
  if (!isPathInsideDirectory(cwd, filePath)) {
    return { context: "", injectedDirectories: [] };
  }

  const directories = collectDirectories(dirname(filePath), cwd, request.includeRoot);
  const blocks: string[] = [];
  const injectedDirectories: string[] = [];

  for (const directory of directories) {
    if (request.alreadyInjectedDirectories.has(directory)) {
      continue;
    }

    const contextPath = join(directory, request.filename);
    if (!(await fileExists(contextPath))) {
      continue;
    }

    try {
      const content = await readFile(contextPath, "utf8");
      const truncated = await request.truncator.truncate(request.sessionId, content);
      const relativePath = relative(cwd, contextPath);
      blocks.push(formatContextBlock({ heading: request.heading, path: relativePath, body: truncated.result }));
      injectedDirectories.push(directory);
    } catch {
      // Best-effort context injection: unreadable context file is skipped.
    }
  }

  return { context: blocks.join("\n"), injectedDirectories };
}

function collectDirectories(startDirectory: string, rootDirectory: string, includeRoot: boolean): string[] {
  const directories: string[] = [];
  let current = resolve(startDirectory);
  const root = resolve(rootDirectory);

  while (true) {
    if (!isPathInsideDirectory(root, current)) {
      break;
    }

    if (includeRoot || current !== root) {
      directories.push(current);
    }

    if (current === root) {
      break;
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return directories.reverse();
}

async function fileExists(path: string): Promise<boolean> {
  return access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
