// Native Claude Code adaptations:
// - bun:test -> node:test/node:assert/strict
// - ToolExecuteOutput shape -> HookEnvelope toolInput/toolResponse path extraction
// - title fallback -> tool_response.metadata fallback because native envelopes do not expose legacy output.title
// Dropped cases:
// - None.

import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { getRuleInjectionFilePath } from "../../src/hooks/rules-injector/index.js";

describe("getRuleInjectionFilePath", () => {
  it("prefers tool input file_path when available", () => {
    const cwd = "/workspace";

    assert.equal(
      getRuleInjectionFilePath({ file_path: "src/app.ts" }, { metadata: { filePath: "other.ts" } }, cwd),
      join(cwd, "src", "app.ts")
    );
  });

  it("falls back to metadata filePath when tool input has no path", () => {
    const cwd = "/workspace";

    assert.equal(getRuleInjectionFilePath({}, { metadata: { filePath: "src/app.ts" } }, cwd), join(cwd, "src", "app.ts"));
  });

  it("falls back to metadata file_path when filePath is missing", () => {
    const cwd = "/workspace";

    assert.equal(getRuleInjectionFilePath({}, { metadata: { file_path: "src/app.ts" } }, cwd), join(cwd, "src", "app.ts"));
  });

  it("returns undefined when both tool input and metadata are empty", () => {
    assert.equal(getRuleInjectionFilePath({}, { metadata: null }, "/workspace"), undefined);
  });
});
