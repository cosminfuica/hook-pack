import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { combineHookResults } from "../../src/core/output.js";
import { formatContextBlock, truncateContent } from "../../src/hooks/shared/context-block.js";
import { collectDirectoryContext } from "../../src/hooks/shared/directory-context.js";
import { isSuccessfulToolResponse } from "../../src/hooks/shared/tool-output.js";
import { withHookFixture } from "../helpers/hook-fixtures.js";

describe("shared context helpers", () => {
  it("formatContextBlock produces deterministic unprefixed heading/path/body shape", () => {
    assert.equal(
      formatContextBlock({ heading: "Directory Context", path: "src/AGENTS.md", body: "Use strict TS." }),
      "[Directory Context: src/AGENTS.md]\nUse strict TS.\n"
    );
  });

  it("combineHookResults prefixes PostToolUse context with hook id", () => {
    const block = formatContextBlock({ heading: "Directory Context", path: "src/AGENTS.md", body: "Use strict TS." });

    const output = combineHookResults("PostToolUse", [{ hookId: "directory-agents", additionalContext: block }]);

    assert.deepEqual(output, {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: "directory-agents: [Directory Context: src/AGENTS.md]\nUse strict TS.\n"
      }
    });
  });

  it("truncateContent adds verbatim truncation notice when content exceeds limit", () => {
    const result = truncateContent("abcdefghij", 4, "src/AGENTS.md");

    assert.equal(result.truncated, true);
    assert.equal(
      result.content,
      "abcd\n\n[Note: Content was truncated to save context window space. For full context, please read the file directly: src/AGENTS.md]"
    );
  });

  it("truncateContent keeps content unchanged when it fits", () => {
    assert.deepEqual(truncateContent("short", 5, "src/file.ts"), { content: "short", truncated: false });
  });

  it("isSuccessfulToolResponse rejects known string failure outputs", () => {
    assert.equal(isSuccessfulToolResponse("error: missing file"), false);
    assert.equal(isSuccessfulToolResponse("Failed to read file"), false);
    assert.equal(isSuccessfulToolResponse("tool could not open file"), false);
    assert.equal(isSuccessfulToolResponse("file read complete"), true);
  });

  it("isSuccessfulToolResponse rejects known object failure shapes", () => {
    assert.equal(isSuccessfulToolResponse({ error: "bad" }), false);
    assert.equal(isSuccessfulToolResponse({ is_error: true }), false);
    assert.equal(isSuccessfulToolResponse({ success: false }), false);
    assert.equal(isSuccessfulToolResponse({ status: "error" }), false);
    assert.equal(isSuccessfulToolResponse({ tool_use_error: "denied" }), false);
    assert.equal(isSuccessfulToolResponse({ success: true, status: "ok" }), true);
  });

  it("collectDirectoryContext skips symlinked targets outside cwd", async () => {
    await withHookFixture(async ({ cwd, srcDir }) => {
      const outsideDir = mkdtempSync(join(tmpdir(), "hook-pack-outside-context-"));
      try {
        mkdirSync(srcDir, { recursive: true });
        writeFileSync(join(outsideDir, "AGENTS.md"), "Outside-only instructions.\n", "utf8");
        writeFileSync(join(outsideDir, "a.ts"), "export const a = 1;\n", "utf8");
        symlinkSync(outsideDir, join(srcDir, "external"), "dir");

        const result = await collectDirectoryContext({
          cwd,
          filePath: "src/external/a.ts",
          filename: "AGENTS.md",
          heading: "Directory Context",
          includeRoot: true,
          truncator: {
            truncate: async (_sessionId, content) => ({ result: content, truncated: false })
          },
          alreadyInjectedDirectories: new Set(),
          sessionId: "session-1"
        });

        assert.deepEqual(result, { context: "", injectedDirectories: [] });
      } finally {
        rmSync(outsideDir, { recursive: true, force: true });
      }
    });
  });
});
