import { loadConfig } from "../core/config.js";
import { dispatchHookEvent } from "../core/dispatcher.js";
import { HookInputError, type HookEnvelope, normalizeHookInput } from "../core/events.js";
import type { ClaudeHookOutput, HookExecutionResult } from "../core/output.js";
import { BUILT_IN_REGISTRY, type RegistryEntry } from "../core/registry.js";

main().catch((error: unknown) => {
  writeError(error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  const rawInput = await readStdin();
  const parsedInput = JSON.parse(rawInput) as unknown;
  const envelope = normalizeHookInput(parsedInput, process.argv[2]);
  const config = loadConfig(envelope.cwd);
  const output = await dispatchHookEvent({
    envelope,
    entries: BUILT_IN_REGISTRY,
    config,
    execute: executeRegisteredEntry
  });

  writeOutput(output);
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      input += chunk;
    });
    process.stdin.on("error", reject);
    process.stdin.on("end", () => {
      resolve(input);
    });
  });
}

async function executeRegisteredEntry(entry: RegistryEntry, envelope: HookEnvelope): Promise<HookExecutionResult> {
  const message = `hook ${entry.id} cannot execute during foundation phase`;

  switch (envelope.eventName) {
    case "PreToolUse":
      return {
        hookId: entry.id,
        permissionDecision: "deny",
        message
      };
    case "Stop":
    case "SubagentStop":
    case "PostToolUse":
      return {
        hookId: entry.id,
        stopDecision: "block",
        message
      };
    default:
      return {
        hookId: entry.id,
        additionalContext: message
      };
  }
}

function writeOutput(output: ClaudeHookOutput): void {
  if (Object.keys(output).length === 0) {
    return;
  }

  process.stdout.write(`${JSON.stringify(output)}\n`);
}

function writeError(error: unknown): void {
  if (error instanceof HookInputError || error instanceof Error) {
    process.stderr.write(`${error.message}\n`);
    return;
  }

  process.stderr.write("Unknown hook-pack CLI dispatch error\n");
}
