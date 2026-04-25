import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { combineHookResults } from "../src/core/output.js";
describe("hook output contracts", () => {
    it("returns no decisions for empty output", () => {
        assert.deepEqual(combineHookResults("PreToolUse", []), {});
    });
    it("resolves PreToolUse permission conflicts as deny then ask then defer then allow", () => {
        const cases = [
            {
                name: "deny beats ask, defer, and allow",
                results: [
                    { hookId: "z-allow", permissionDecision: "allow", message: "allow message" },
                    { hookId: "b-ask", permissionDecision: "ask", message: "ask message" },
                    { hookId: "a-deny", permissionDecision: "deny", message: "deny message", updatedInput: { command: "safe" } },
                    { hookId: "c-defer", permissionDecision: "defer", message: "defer message" }
                ],
                expected: {
                    hookSpecificOutput: {
                        hookEventName: "PreToolUse",
                        permissionDecision: "deny",
                        permissionDecisionReason: "deny message",
                        updatedInput: { command: "safe" }
                    },
                    systemMessage: "a-deny: deny message"
                }
            },
            {
                name: "ask beats defer and allow",
                results: [
                    { hookId: "z-allow", permissionDecision: "allow", message: "allow message" },
                    { hookId: "b-ask", permissionDecision: "ask", message: "ask message" },
                    { hookId: "c-defer", permissionDecision: "defer", message: "defer message" }
                ],
                expected: {
                    hookSpecificOutput: {
                        hookEventName: "PreToolUse",
                        permissionDecision: "ask",
                        permissionDecisionReason: "ask message"
                    },
                    systemMessage: "b-ask: ask message"
                }
            },
            {
                name: "defer beats allow",
                results: [
                    { hookId: "z-allow", permissionDecision: "allow", message: "allow message" },
                    { hookId: "c-defer", permissionDecision: "defer", message: "defer message" }
                ],
                expected: {
                    hookSpecificOutput: {
                        hookEventName: "PreToolUse",
                        permissionDecision: "defer",
                        permissionDecisionReason: "defer message"
                    },
                    systemMessage: "c-defer: defer message"
                }
            },
            {
                name: "allow returns allow output",
                results: [
                    { hookId: "z-allow", permissionDecision: "allow", message: "allow message" }
                ],
                expected: {
                    hookSpecificOutput: {
                        hookEventName: "PreToolUse",
                        permissionDecision: "allow",
                        permissionDecisionReason: "allow message"
                    },
                    systemMessage: "z-allow: allow message"
                }
            }
        ];
        for (const { name, results, expected } of cases) {
            assert.deepEqual(combineHookResults("PreToolUse", results), expected, name);
        }
    });
    it("uses the sorted lower hook ID for same-priority PreToolUse permissions", () => {
        assert.deepEqual(combineHookResults("PreToolUse", [
            { hookId: "zeta", permissionDecision: "deny", message: "last deny" },
            { hookId: "alpha", permissionDecision: "deny", message: "first deny" }
        ]), {
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: "first deny"
            },
            systemMessage: "alpha: first deny"
        });
    });
    it("uses the sorted first Stop block and reports non-block Stop messages as systemMessage", () => {
        assert.deepEqual(combineHookResults("Stop", [
            { hookId: "z-block", stopDecision: "block", message: "later block" },
            { hookId: "a-block", stopDecision: "block", message: "first block" },
            { hookId: "m-pass", stopDecision: "pass", message: "pass message" }
        ]), {
            decision: "block",
            reason: "first block",
            systemMessage: "a-block: first block"
        });
        assert.deepEqual(combineHookResults("SubagentStop", [
            { hookId: "z-pass", stopDecision: "pass", message: "second" },
            { hookId: "a-pass", stopDecision: "pass", message: "first" }
        ]), {
            systemMessage: "a-pass: first\nz-pass: second"
        });
    });
    it("sorts messages and additional context by hook ID for deterministic output", () => {
        assert.deepEqual(combineHookResults("SessionStart", [
            { hookId: "z-hook", message: "message z", additionalContext: "context z" },
            { hookId: "a-hook", message: "message a", additionalContext: "context a" },
            { hookId: "m-hook", additionalContext: "context m" }
        ]), {
            hookSpecificOutput: {
                hookEventName: "SessionStart",
                additionalContext: "a-hook: context a\nm-hook: context m\nz-hook: context z"
            },
            systemMessage: "a-hook: message a\nz-hook: message z"
        });
    });
    it("uses hookSpecificOutput additional context for UserPromptSubmit and PreCompact", () => {
        const cases = [
            {
                eventName: "UserPromptSubmit",
                results: [{ hookId: "context-hook", additionalContext: "prompt context" }],
                expected: {
                    hookSpecificOutput: {
                        hookEventName: "UserPromptSubmit",
                        additionalContext: "context-hook: prompt context"
                    }
                }
            },
            {
                eventName: "PreCompact",
                results: [{ hookId: "memory-hook", additionalContext: "compact context" }],
                expected: {
                    hookSpecificOutput: {
                        hookEventName: "PreCompact",
                        additionalContext: "memory-hook: compact context"
                    }
                }
            }
        ];
        for (const { eventName, results, expected } of cases) {
            assert.deepEqual(combineHookResults(eventName, results), expected);
        }
    });
    it("blocks PostToolUse with top-level block output before additional context", () => {
        assert.deepEqual(combineHookResults("PostToolUse", [
            { hookId: "z-context", additionalContext: "context" },
            { hookId: "a-block", stopDecision: "block", message: "block post tool" }
        ]), {
            decision: "block",
            reason: "block post tool",
            systemMessage: "a-block: block post tool"
        });
        assert.deepEqual(combineHookResults("PostToolUse", [
            { hookId: "context-hook", additionalContext: "post context" }
        ]), {
            hookSpecificOutput: {
                hookEventName: "PostToolUse",
                additionalContext: "context-hook: post context"
            }
        });
    });
});
