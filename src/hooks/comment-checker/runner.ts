import { spawn } from "node:child_process";

export interface CommentCheckerRunInput {
  readonly sessionId: string;
  readonly cwd: string;
  readonly toolName: string;
  readonly filePath: string;
  readonly content?: string | undefined;
  readonly oldString?: string | undefined;
  readonly newString?: string | undefined;
  readonly edits?: readonly { readonly old_string: string; readonly new_string: string }[] | undefined;
}

export interface CommentCheckerRunResult {
  readonly hasComments: boolean;
  readonly message: string;
  readonly unavailable?: boolean | undefined;
}

export type CommentCheckerRunner = (input: CommentCheckerRunInput) => Promise<CommentCheckerRunResult>;

export interface RunCommentCheckerCommandOptions {
  readonly timeoutMs?: number | undefined;
  readonly killGraceMs?: number | undefined;
  readonly signal?: AbortSignal | undefined;
  readonly env?: MinimalCheckerEnvironment | undefined;
}

interface MinimalCheckerEnvironment {
  readonly PATH?: string | undefined;
  readonly SystemRoot?: string | undefined;
}

const DEFAULT_TIMEOUT_MS = 6_000;
const DEFAULT_KILL_GRACE_MS = 1_000;
const MAX_STDERR_CHARS = 4_096;
const DEFAULT_FINDING_MESSAGE = "Comment checker reported findings.";

export function runCommentCheckerCommand(
  binaryPath: string,
  input: CommentCheckerRunInput,
  options: RunCommentCheckerCommandOptions = {}
): Promise<CommentCheckerRunResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const killGraceMs = options.killGraceMs ?? DEFAULT_KILL_GRACE_MS;

  return new Promise((resolve) => {
    let settled = false;
    let terminating = false;
    let stderr = "";
    let termTimer: NodeJS.Timeout | undefined;
    let killTimer: NodeJS.Timeout | undefined;

    const child = spawn(binaryPath, ["check"], {
      detached: process.platform !== "win32",
      env: buildCheckerEnv(options.env),
      stdio: ["pipe", "ignore", "pipe"],
      shell: false
    });
    child.unref();
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk: string) => {
      stderr = appendCapped(stderr, chunk, MAX_STDERR_CHARS);
    });
    child.stdin.on("error", () => {
      // Checker may exit before reading stdin; exit-code mapping below remains authoritative.
    });

    child.on("error", () => {
      finish({ hasComments: false, message: "", unavailable: true });
    });

    child.on("close", (exitCode) => {
      if (terminating) {
        finish({ hasComments: false, message: "", unavailable: true });
        return;
      }
      if (exitCode === 0) {
        finish({ hasComments: false, message: "" });
        return;
      }
      if (exitCode === 2) {
        finish({ hasComments: true, message: normalizeFindingMessage(stderr) });
        return;
      }
      finish({ hasComments: false, message: "", unavailable: true });
    });

    options.signal?.addEventListener("abort", () => {
      terminateChild();
    }, { once: true });

    try {
      child.stdin.end(`${JSON.stringify(toCheckerHookInput(input))}\n`);
    } catch {
      finish({ hasComments: false, message: "", unavailable: true });
    }

    termTimer = setTimeout(() => {
      terminateChild();
    }, timeoutMs);

    if (options.signal?.aborted === true) {
      terminateChild();
    }

    function terminateChild(): void {
      if (settled || terminating) {
        return;
      }
      terminating = true;
      if (termTimer !== undefined) {
        clearTimeout(termTimer);
        termTimer = undefined;
      }
      killChild(child.pid, "SIGTERM");
      killTimer = setTimeout(() => {
        killChild(child.pid, "SIGKILL");
      }, killGraceMs);
    }

    function finish(result: CommentCheckerRunResult): void {
      if (settled) {
        return;
      }
      settled = true;
      if (termTimer !== undefined) {
        clearTimeout(termTimer);
      }
      if (!terminating && killTimer !== undefined) {
        clearTimeout(killTimer);
      }
      resolve(result);
    }
  });
}

function toCheckerHookInput(input: CommentCheckerRunInput) {
  return {
    session_id: input.sessionId,
    tool_name: toClaudeToolName(input.toolName),
    transcript_path: "",
    cwd: input.cwd,
    hook_event_name: "PostToolUse",
    tool_input: {
      file_path: input.filePath,
      ...(input.content === undefined ? {} : { content: input.content }),
      ...(input.oldString === undefined ? {} : { old_string: input.oldString }),
      ...(input.newString === undefined ? {} : { new_string: input.newString }),
      ...(input.edits === undefined ? {} : { edits: input.edits })
    }
  };
}

function toClaudeToolName(toolName: string): string {
  const normalized = toolName.toLowerCase();
  if (normalized === "write") {
    return "Write";
  }
  if (normalized === "edit") {
    return "Edit";
  }
  if (normalized === "multiedit") {
    return "MultiEdit";
  }
  return toolName;
}

function appendCapped(existing: string, chunk: string, maxChars: number): string {
  if (existing.length >= maxChars) {
    return existing;
  }
  return `${existing}${chunk.slice(0, maxChars - existing.length)}`;
}

function normalizeFindingMessage(stderr: string): string {
  const message = stderr.trim();
  return message === "" ? DEFAULT_FINDING_MESSAGE : message;
}

function buildCheckerEnv(env: MinimalCheckerEnvironment | undefined): Record<string, string> {
  const minimalEnv: Record<string, string> = {};
  const path = env?.PATH ?? process.env.PATH;
  if (path !== undefined) {
    minimalEnv.PATH = path;
  }
  const systemRoot = env?.SystemRoot ?? process.env.SystemRoot;
  if (systemRoot !== undefined) {
    minimalEnv.SystemRoot = systemRoot;
  }
  return minimalEnv;
}

function killChild(pid: number | undefined, signal: NodeJS.Signals): void {
  if (pid === undefined) {
    return;
  }
  try {
    if (process.platform !== "win32") {
      process.kill(-pid, signal);
      return;
    }
    process.kill(pid, signal);
  } catch {
    // Child may have exited between timeout and signal delivery.
  }
}
