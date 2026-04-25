import { loadConfig } from "../core/config.js";
import { dispatchHookEvent } from "../core/dispatcher.js";
import { HookInputError, normalizeHookInput } from "../core/events.js";
import { BUILT_IN_REGISTRY } from "../core/registry.js";
main().catch((error) => {
    writeError(error);
    process.exitCode = 1;
});
async function main() {
    const rawInput = await readStdin();
    const parsedInput = JSON.parse(rawInput);
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
function readStdin() {
    return new Promise((resolve, reject) => {
        let input = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => {
            input += chunk;
        });
        process.stdin.on("error", reject);
        process.stdin.on("end", () => {
            resolve(input);
        });
    });
}
async function executeRegisteredEntry(entry, envelope) {
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
function writeOutput(output) {
    if (Object.keys(output).length === 0) {
        return;
    }
    process.stdout.write(`${JSON.stringify(output)}\n`);
}
function writeError(error) {
    if (error instanceof HookInputError || error instanceof Error) {
        process.stderr.write(`${error.message}\n`);
        return;
    }
    process.stderr.write("Unknown hook-pack CLI dispatch error\n");
}
