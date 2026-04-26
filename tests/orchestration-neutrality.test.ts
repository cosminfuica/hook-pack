import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const shippedSourcePaths = ["src", "hooks/hooks.json", ".claude-plugin/plugin.json"];
const forbiddenPattern = /sisyphus|opencode|\bomo\b|OPENCODE_/i;

describe("orchestration neutrality", () => {
  it("contains no orchestration-specific identifiers in shipped sources", () => {
    const matches = shippedSourcePaths.flatMap(scanPath).filter(({ content }) => forbiddenPattern.test(content));

    assert.deepEqual(matches.map(({ path }) => path), []);
  });
});

function scanPath(path: string): Array<{ readonly path: string; readonly content: string }> {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    return readdirSync(path).flatMap((entry) => scanPath(join(path, entry)));
  }
  if (!path.endsWith(".ts") && !path.endsWith(".json")) {
    return [];
  }
  return [{ path, content: readFileSync(path, "utf8") }];
}
