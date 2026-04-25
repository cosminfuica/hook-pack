import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EVENT_DEFINITIONS,
  HookInputError,
  REGISTERED_DISPATCH_EVENTS,
  SUPPORTED_EVENTS,
  normalizeHookInput
} from "../src/core/events.js";

describe("event adapter contracts", () => {
  const toolMatchedEvents = [
    "PreToolUse",
    "PostToolUse",
    "PostToolUseFailure",
    "PermissionRequest",
    "PermissionDenied"
  ] as const;

  function findDefinition(eventName: string) {
    const definition = EVENT_DEFINITIONS.find((event) => event.name === eventName);
    assert.ok(definition, `${eventName} definition must exist`);
    return definition;
  }

  it("declares the supported event catalog", () => {
    assert.deepEqual(SUPPORTED_EVENTS, [
      "SessionStart",
      "UserPromptSubmit",
      "UserPromptExpansion",
      "PreToolUse",
      "PermissionRequest",
      "PermissionDenied",
      "PostToolUse",
      "PostToolUseFailure",
      "PostToolBatch",
      "Notification",
      "SubagentStart",
      "SubagentStop",
      "TaskCreated",
      "TaskCompleted",
      "Stop",
      "StopFailure",
      "TeammateIdle",
      "InstructionsLoaded",
      "ConfigChange",
      "CwdChanged",
      "FileChanged",
      "WorktreeCreate",
      "WorktreeRemove",
      "PreCompact",
      "PostCompact",
      "Elicitation",
      "ElicitationResult",
      "SessionEnd"
    ]);
  });

  it("defines event metadata as iterable definitions", () => {
    assert.ok(EVENT_DEFINITIONS.some((event) => event.name === "SessionEnd"));

    const matcherBehaviorCases = [
      ["PreToolUse", "tool"],
      ["PostToolUse", "tool"],
      ["PostToolUseFailure", "tool"],
      ["PermissionRequest", "tool"],
      ["PermissionDenied", "tool"],
      ["SessionEnd", "event-specific"],
      ["TaskCreated", "event-specific"]
    ] as const;

    for (const [eventName, matcherBehavior] of matcherBehaviorCases) {
      assert.equal(findDefinition(eventName).matcherBehavior, matcherBehavior);
    }

    const outputCapabilityCases = [
      ["PreToolUse", ["permission", "context"]],
      ["Stop", ["block", "context"]],
      ["SubagentStop", ["block", "context"]],
      ["UserPromptSubmit", ["context"]],
      ["SessionStart", ["context"]],
      ["PostToolUse", ["context"]],
      ["PreCompact", ["context"]],
      ["Notification", ["notification"]],
      ["SessionEnd", []]
    ] as const;

    for (const [eventName, outputCapabilities] of outputCapabilityCases) {
      assert.deepEqual(findDefinition(eventName).outputCapabilities, outputCapabilities);
    }

    const staleMetadataValues = ["permissionDecision", "updatedInput", "decision", "continue"];
    for (const definition of EVENT_DEFINITIONS) {
      assert.notEqual(definition.matcherBehavior, "none");
      assert.deepEqual(
        definition.outputCapabilities.filter((capability) => staleMetadataValues.includes(capability)),
        [],
        `${definition.name} must not use stale output capability names`
      );
    }
  });

  it("keeps registered dispatch events aligned with hooks.json registrations", () => {
    assert.deepEqual(REGISTERED_DISPATCH_EVENTS, [
      "SessionStart",
      "UserPromptSubmit",
      "PreToolUse",
      "PostToolUse",
      "Stop",
      "SubagentStop",
      "PreCompact",
      "Notification"
    ]);
  });

  it("normalizes PreToolUse input with tool fields", () => {
    const toolInput = { file_path: "README.md" };
    const toolResponse = { decision: "allow" };
    const normalized = normalizeHookInput({
      session_id: "session-123",
      cwd: "/project",
      hook_event_name: "PreToolUse",
      tool_name: "Write",
      tool_input: toolInput,
      tool_response: toolResponse
    }, "PreToolUse");

    assert.equal(normalized.eventName, "PreToolUse");
    assert.equal(normalized.sessionId, "session-123");
    assert.equal(normalized.cwd, "/project");
    assert.equal(normalized.toolName, "Write");
    assert.deepEqual(normalized.toolInput, toolInput);
    assert.deepEqual(normalized.toolResponse, toolResponse);
  });

  it("rejects every tool-matched event without tool_name", () => {
    for (const eventName of toolMatchedEvents) {
      assert.throws(
        () =>
          normalizeHookInput({
            cwd: "/project",
            hook_event_name: eventName
          }, eventName),
        HookInputError,
        `${eventName} must reject missing tool_name`
      );

      assert.throws(
        () =>
          normalizeHookInput({
            cwd: "/project",
            hook_event_name: eventName,
            tool_name: "  "
          }, eventName),
        HookInputError,
        `${eventName} must reject blank tool_name`
      );
    }
  });

  it("accepts every tool-matched event with tool_name", () => {
    for (const eventName of toolMatchedEvents) {
      const normalized = normalizeHookInput({
        cwd: "/project",
        hook_event_name: eventName,
        tool_name: "Write"
      }, eventName);

      assert.equal(normalized.eventName, eventName);
      assert.equal(normalized.toolName, "Write");
    }
  });

  it("normalizes UserPromptSubmit input with prompt", () => {
    const normalized = normalizeHookInput({
      cwd: "/project",
      hook_event_name: "UserPromptSubmit",
      user_prompt: "Add tests"
    }, "UserPromptSubmit");

    assert.equal(normalized.eventName, "UserPromptSubmit");
    assert.equal(normalized.cwd, "/project");
    assert.equal(normalized.userPrompt, "Add tests");
  });

  it("normalizes supported events without expected event argument", () => {
    const normalized = normalizeHookInput({
      cwd: "/project",
      hook_event_name: "SessionStart",
      session_id: "session-456"
    });

    assert.equal(normalized.eventName, "SessionStart");
    assert.equal(normalized.sessionId, "session-456");
    assert.equal(normalized.cwd, "/project");
  });

  it("rejects mismatched expected event names", () => {
    assert.throws(
      () =>
        normalizeHookInput({
          cwd: "/project",
          hook_event_name: "PostToolUse",
          tool_name: "Write"
        }, "PreToolUse"),
      HookInputError
    );
  });

  it("rejects missing cwd", () => {
    assert.throws(
      () =>
        normalizeHookInput({
          hook_event_name: "UserPromptSubmit",
          user_prompt: "Add tests"
        }, "UserPromptSubmit"),
      /cwd must be a string/
    );
  });
});
