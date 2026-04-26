import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDynamicTruncator } from "../../src/hooks/shared/dynamic-truncator.js";

describe("dynamic truncator", () => {
  it("returns untruncated content when content fits within maxContextChars", async () => {
    const truncator = createDynamicTruncator({ maxContextChars: 10 });

    assert.deepEqual(await truncator.truncate("session", "short"), { result: "short", truncated: false });
  });

  it("slices content at maxContextChars when content exceeds limit", async () => {
    const truncator = createDynamicTruncator({ maxContextChars: 4 });

    assert.deepEqual(await truncator.truncate("session", "abcdefgh"), { result: "abcd", truncated: true });
  });

  it("uses model-aware limit when modelContextWindow is at least one million", async () => {
    const truncator = createDynamicTruncator({ maxContextChars: 4, modelContextWindow: 1_000_000 });

    assert.deepEqual(await truncator.truncate("session", "abcdefghijklmnop"), { result: "abcdefghijklmnop", truncated: false });
    assert.deepEqual(await truncator.truncate("session", "abcdefghijklmnopqrstu"), { result: "abcdefghijklmnopqrst", truncated: true });
  });

  it("uses model-aware limit when anthropic 1M context cache state is enabled", async () => {
    const truncator = createDynamicTruncator({
      maxContextChars: 4,
      modelCacheState: { anthropicContext1MEnabled: true }
    });

    assert.deepEqual(await truncator.truncate("session", "abcdefghijklmnop"), { result: "abcdefghijklmnop", truncated: false });
  });

  it("falls back to userConfig.maxContextChars when no model info is provided", async () => {
    const truncator = createDynamicTruncator({ maxContextChars: 6 });

    assert.deepEqual(await truncator.truncate("session", "abcdefgh"), { result: "abcdef", truncated: true });
  });
});
