import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dispatchHookEvent } from "../src/core/dispatcher.js";
describe("dispatcher core", () => {
    const baseConfig = {
        enabled: true,
        enableAllHooksByDefault: false,
        enabledHooks: [],
        disabledHooks: []
    };
    it("returns empty output when no entries are enabled", async () => {
        const entries = [makeEntry("disabled-hook", { defaultEnabled: false })];
        const output = await dispatchHookEvent({
            config: baseConfig,
            envelope: makeEnvelope("PreToolUse"),
            entries,
            execute: async () => ({
                hookId: "disabled-hook",
                permissionDecision: "deny",
                message: "disabled hook executed unexpectedly"
            })
        });
        assert.deepEqual(output, {});
    });
    it("executes selected entries and returns combined output", async () => {
        const entries = [
            makeEntry("beta-hook", { defaultEnabled: true }),
            makeEntry("alpha-hook", { defaultEnabled: true })
        ];
        const executedHookIds = [];
        const output = await dispatchHookEvent({
            config: baseConfig,
            envelope: makeEnvelope("PreToolUse"),
            entries,
            execute: async (entry) => {
                executedHookIds.push(entry.id);
                return entry.id === "alpha-hook"
                    ? { hookId: entry.id, permissionDecision: "allow", message: "safe" }
                    : { hookId: entry.id, permissionDecision: "deny", message: "unsafe" };
            }
        });
        assert.deepEqual(new Set(executedHookIds), new Set(["alpha-hook", "beta-hook"]));
        assert.deepEqual(output, {
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: "unsafe"
            },
            systemMessage: "beta-hook: unsafe"
        });
    });
    it("converts registry diagnostics to safe systemMessage before executing entries", async () => {
        const output = await dispatchHookEvent({
            config: {
                ...baseConfig,
                enabledHooks: ["missing-hook"]
            },
            envelope: makeEnvelope("PreToolUse"),
            entries: [makeEntry("known-hook", { defaultEnabled: true })],
            execute: async () => {
                throw new Error("should not execute with registry diagnostics");
            }
        });
        assert.deepEqual(output, {
            systemMessage: "hook-pack: Configured hook ID is not implemented: missing-hook"
        });
    });
    it("isolates hook failures and converts PreToolUse failures to deterministic fail-closed output", async () => {
        const output = await dispatchHookEvent({
            config: baseConfig,
            envelope: makeEnvelope("PreToolUse"),
            entries: [makeEntry("broken-hook", { defaultEnabled: true })],
            execute: async () => {
                throw new Error("boom");
            }
        });
        assert.deepEqual(output, {
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: "hook broken-hook failed: boom"
            },
            systemMessage: "broken-hook: hook broken-hook failed: boom"
        });
    });
    it("uses entry timeout when isolating hook execution failures", async () => {
        const output = await dispatchHookEvent({
            config: baseConfig,
            envelope: makeEnvelope("PreToolUse"),
            entries: [makeEntry("slow-hook", { defaultEnabled: true, timeoutMs: 1 })],
            execute: () => new Promise(() => { })
        });
        assert.deepEqual(output, {
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: "hook slow-hook failed: timed out after 1ms"
            },
            systemMessage: "slow-hook: hook slow-hook failed: timed out after 1ms"
        });
    });
    it("validates registry entries before executing selected hooks", async () => {
        const output = await dispatchHookEvent({
            config: {
                ...baseConfig,
                enableAllHooksByDefault: true
            },
            envelope: makeEnvelope("PreToolUse"),
            entries: [
                makeEntry("bad_id", { timeoutMs: 0 }),
                makeEntry("duplicate-hook"),
                makeEntry("duplicate-hook")
            ],
            execute: async () => {
                throw new Error("should not execute with registry diagnostics");
            }
        });
        assert.deepEqual(output, {
            systemMessage: "hook-pack: Invalid hook ID: bad_id\nInvalid timeout for bad_id\nDuplicate hook ID: duplicate-hook"
        });
    });
    it("ignores late rejections after timeout-shaped fail-closed output", async () => {
        const unhandledRejections = [];
        const onUnhandledRejection = (reason) => {
            unhandledRejections.push(reason);
        };
        process.on("unhandledRejection", onUnhandledRejection);
        try {
            const output = await dispatchHookEvent({
                config: baseConfig,
                envelope: makeEnvelope("PreToolUse"),
                entries: [makeEntry("late-hook", { defaultEnabled: true, timeoutMs: 1 })],
                execute: () => new Promise((_resolve, reject) => {
                    setTimeout(() => reject(new Error("late boom")), 10);
                })
            });
            await new Promise((resolve) => {
                setTimeout(resolve, 25);
            });
            assert.deepEqual(output, {
                hookSpecificOutput: {
                    hookEventName: "PreToolUse",
                    permissionDecision: "deny",
                    permissionDecisionReason: "hook late-hook failed: timed out after 1ms"
                },
                systemMessage: "late-hook: hook late-hook failed: timed out after 1ms"
            });
            assert.deepEqual(unhandledRejections, []);
        }
        finally {
            process.off("unhandledRejection", onUnhandledRejection);
        }
    });
    it("shapes multi-event hook failures according to the current event", async () => {
        const multiEventEntry = makeEntry("multi-hook", {
            defaultEnabled: true,
            events: ["PreToolUse", "Stop", "SubagentStop", "PostToolUse", "UserPromptSubmit"]
        });
        const outputs = await Promise.all([
            dispatchFailingRequest("PreToolUse", multiEventEntry),
            dispatchFailingRequest("Stop", multiEventEntry),
            dispatchFailingRequest("SubagentStop", multiEventEntry),
            dispatchFailingRequest("PostToolUse", multiEventEntry),
            dispatchFailingRequest("UserPromptSubmit", multiEventEntry)
        ]);
        assert.deepEqual(outputs, [
            {
                hookSpecificOutput: {
                    hookEventName: "PreToolUse",
                    permissionDecision: "deny",
                    permissionDecisionReason: "hook multi-hook failed: event boom"
                },
                systemMessage: "multi-hook: hook multi-hook failed: event boom"
            },
            {
                decision: "block",
                reason: "hook multi-hook failed: event boom",
                systemMessage: "multi-hook: hook multi-hook failed: event boom"
            },
            {
                decision: "block",
                reason: "hook multi-hook failed: event boom",
                systemMessage: "multi-hook: hook multi-hook failed: event boom"
            },
            {
                decision: "block",
                reason: "hook multi-hook failed: event boom",
                systemMessage: "multi-hook: hook multi-hook failed: event boom"
            },
            {
                hookSpecificOutput: {
                    hookEventName: "UserPromptSubmit",
                    additionalContext: "multi-hook: hook multi-hook failed: event boom"
                }
            }
        ]);
    });
    async function dispatchFailingRequest(eventName, entry) {
        const request = {
            config: baseConfig,
            envelope: makeEnvelope(eventName),
            entries: [entry],
            execute: async () => {
                throw new Error("event boom");
            }
        };
        return dispatchHookEvent(request);
    }
});
function makeEnvelope(eventName) {
    return {
        eventName,
        sessionId: "session-1",
        cwd: "/workspace",
        raw: { hook_event_name: eventName, cwd: "/workspace" },
        toolName: eventName === "PreToolUse" || eventName === "PostToolUse" ? "Bash" : undefined,
        toolInput: eventName === "PreToolUse" || eventName === "PostToolUse" ? {} : undefined,
        toolResponse: eventName === "PostToolUse" ? { ok: true } : undefined,
        userPrompt: eventName === "UserPromptSubmit" ? "hello" : undefined
    };
}
function makeEntry(id, override = {}) {
    return {
        id,
        events: override.events ?? ["PreToolUse"],
        defaultEnabled: override.defaultEnabled ?? false,
        runner: override.runner ?? {
            kind: "internal",
            handlerId: "dispatcher-test-handler"
        },
        timeoutMs: override.timeoutMs ?? 1000
    };
}
