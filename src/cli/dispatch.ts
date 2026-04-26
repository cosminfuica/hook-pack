import { loadConfig } from "../core/config.js";
import { dispatchHookEvent } from "../core/dispatcher.js";
import { executeRegistryEntry } from "../core/entry-runner.js";
import { HookInputError, normalizeHookInput } from "../core/events.js";
import type { ClaudeHookOutput } from "../core/output.js";
import { resolveRuntimeContext } from "../core/runtime-context.js";
import { BUILT_IN_REGISTRY } from "../core/registry.js";
import { getBuiltInHookHandler } from "../hooks/index.js";

main().catch((error: unknown) => {
  writeError(error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  const rawInput = await readStdin();
  const parsedInput = JSON.parse(rawInput) as unknown;
  const envelope = normalizeHookInput(parsedInput, process.argv[2]);
  const config = loadConfig(envelope.cwd, process.env);
  const runtimeContext = resolveRuntimeContext(envelope.cwd, process.env, Date.now, {
    maxContextChars: config.maxContextChars,
    includeUserRules: config.includeUserRules
  });
  const output = await dispatchHookEvent({
    envelope,
    entries: BUILT_IN_REGISTRY,
    config,
    execute: (entry, currentEnvelope) => executeRegistryEntry({
      entry,
      envelope: currentEnvelope,
      runtimeContext,
      resolveBuiltInHookHandler: getBuiltInHookHandler
    })
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
