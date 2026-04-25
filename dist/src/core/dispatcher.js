import { combineHookResults } from "./output.js";
import { selectRegistryEntries, validateRegistry } from "./registry.js";
export async function dispatchHookEvent(request) {
    const validationDiagnostics = validateRegistry(request.entries);
    if (validationDiagnostics.length > 0) {
        return safeDiagnosticOutput(validationDiagnostics);
    }
    const selection = selectRegistryEntries(request.entries, request.envelope, request.config);
    if (selection.diagnostics.length > 0) {
        return safeDiagnosticOutput(selection.diagnostics);
    }
    const results = await Promise.all(selection.entries.map((entry) => executeEntrySafely(entry, request.envelope, request.execute)));
    return combineHookResults(request.envelope.eventName, results);
}
async function executeEntrySafely(entry, envelope, execute) {
    try {
        return await withTimeout(execute(entry, envelope), entry.timeoutMs);
    }
    catch (error) {
        return failedHookResult(entry.id, envelope.eventName, getFailureReason(error));
    }
}
function safeDiagnosticOutput(diagnostics) {
    return {
        systemMessage: `hook-pack: ${diagnostics.map((diagnostic) => diagnostic.message).join("\n")}`
    };
}
function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        promise.then((value) => {
            clearTimeout(timeout);
            resolve(value);
        }, (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}
function failedHookResult(hookId, eventName, reason) {
    const message = `hook ${hookId} failed: ${reason}`;
    switch (eventName) {
        case "PreToolUse":
            return {
                hookId,
                permissionDecision: "deny",
                message
            };
        case "Stop":
        case "SubagentStop":
        case "PostToolUse":
            return {
                hookId,
                stopDecision: "block",
                message
            };
        default:
            return {
                hookId,
                additionalContext: message
            };
    }
}
function getFailureReason(error) {
    if (error instanceof Error && error.message.trim() !== "") {
        return error.message;
    }
    if (typeof error === "string" && error.trim() !== "") {
        return error;
    }
    return "unknown error";
}
